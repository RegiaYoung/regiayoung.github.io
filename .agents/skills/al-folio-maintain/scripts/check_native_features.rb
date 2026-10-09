#!/usr/bin/env ruby
# Read-only wiring guard. Browser behavior and dependency upgrades need separate tests.
require 'date'
require 'json'
require 'optparse'
require 'pathname'
require 'yaml'

options = { root: '.', policy: File.expand_path('../references/regia-native-policy.json', __dir__) }
OptionParser.new do |parser|
  parser.banner = 'Usage: ruby check_native_features.rb --root SITE [--policy POLICY.json]'
  parser.on('--root PATH', 'Site repository root') { |value| options[:root] = value }
  parser.on('--policy PATH', 'Explicit feature policy; default is for regia.me only') { |value| options[:policy] = value }
end.parse!

begin
  root = Pathname.new(options[:root]).expand_path
  policy = JSON.parse(File.read(options[:policy]))
  errors = []
  checks = 0
  check = lambda do |condition, message|
    checks += 1
    errors << message unless condition
  end
  yaml = lambda do |text|
    value = YAML.safe_load(text, permitted_classes: [Date, Time], aliases: true)
    raise ArgumentError, 'Expected a YAML mapping' unless value.is_a?(Hash)
    value
  end
  read = lambda do |relative|
    file = root.join(relative)
    if file.file?
      file.read
    else
      errors << "Missing file: #{relative}"
      ''
    end
  end
  value_at = lambda do |data, key|
    key.split('.').reduce(data) { |value, part| value.is_a?(Hash) ? value[part] : nil }
  end
  check_values = lambda do |data, expected, label|
    expected.each do |key, wanted|
      actual = value_at.call(data, key)
      comparison = key == 'feed.path' && actual.is_a?(String) ? "/#{actual.delete_prefix('/')}" : actual
      check.call(comparison == wanted, "#{label}: #{key} expected #{wanted.inspect}, got #{actual.inspect}")
    end
  end
  config = yaml.call(read.call('_config.yml'))
  check_values.call(config, policy.fetch('config'), '_config.yml')
  check.call(read.call('CNAME').strip == policy.fetch('domain'), 'CNAME differs from the site policy')

  plugins = Array(config['plugins'])
  gem_names = read.call('Gemfile').scan(/^\s*gem\s+['"]([^'"]+)['"]/).flatten
  policy.fetch('plugins').each do |plugin, gem|
    check.call(plugins.include?(plugin), "Plugin not activated: #{plugin}")
    check.call(gem_names.include?(gem), "Missing Gemfile dependency for #{plugin}: #{gem}")
  end
  archive_types = Array(config.dig('jekyll-archives', 'posts', 'enabled'))
  %w[year tags categories].each do |type|
    check.call(archive_types.include?(type), "Missing post archive type: #{type}")
  end

  pages = {}
  routes = Hash.new { |hash, key| hash[key] = [] }
  root.glob('{_pages,_posts}/**/*').select(&:file?).each do |file|
    next unless %w[.md .html .markdown].include?(file.extname)
    source = file.read
    match = source.match(/\A---\r?\n(.*?)\r?\n---(?:\r?\n|\z)/m)
    next unless match
    data = yaml.call(match[1])
    relative = file.relative_path_from(root).to_s
    pages[relative] = [data, source]
    route = data['permalink']
    routes[route] << relative if route.is_a?(String)
  end
  routes.each do |route, owners|
    check.call(owners.length == 1, "Duplicate permalink #{route}: #{owners.join(', ')}")
  end
  policy.fetch('pages').each do |path, requirements|
    entry = pages[path]
    check.call(!entry.nil?, "Missing front-matter page: #{path}")
    next unless entry
    data, source = entry
    check_values.call(data, requirements.fetch('front_matter'), path)
    # These are presence checks, not a Liquid interpreter or proof of rendering.
    requirements.fetch('native_patterns', []).each do |pattern|
      check.call(Regexp.new(pattern, Regexp::MULTILINE).match?(source), "#{path}: native connection missing (#{pattern})")
    end
  end
  policy.fetch('redirects').each do |from, target|
    owner = routes[from]&.first
    source = owner && pages[owner][1]
    refresh = source && source.match?(/http-equiv=["']refresh["']/i) && source.include?("url=#{target}")
    check.call(refresh, "Missing HTML redirect: #{from} -> #{target}")
  end

  repositories = yaml.call(read.call('_data/repositories.yml'))
  %w[github_users github_repos].each do |key|
    check.call(repositories[key].is_a?(Array) && !repositories[key].empty?, "Native repository data missing: #{key}")
  end
  socials = yaml.call(read.call('_data/socials.yml'))
  feed = "/#{(config.dig('feed', 'path') || 'feed.xml').delete_prefix('/')}"
  rss_url = socials['rss_icon'] ? '/feed.xml' : socials.dig('rss', 'url')
  check.call(rss_url == feed || rss_url == "#{config['url']}#{feed}", "RSS social link #{rss_url.inspect} does not match feed #{feed.inspect}")

  if errors.empty?
    puts "PASS: #{checks} native wiring checks for #{policy.fetch('name')}."
    puts 'Also run the official upgrade audit, build/link checks, and affected browser interactions.'
  else
    warn "FAIL: #{errors.length} issue(s) in #{checks} native wiring checks:"
    errors.each { |error| warn "- #{error}" }
    warn 'Restore unintended losses. Update policy only for an intentional, authorized site change.'
    exit 1
  end
rescue Errno::ENOENT, Psych::Exception, JSON::ParserError, ArgumentError, KeyError => error
  warn "Cannot complete native feature check: #{error.message}"
  exit 2
end
