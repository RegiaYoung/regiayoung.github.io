# frozen_string_literal: true
# Feed the PDF renderer with the same data adapter as the native HTML CV.
require "jekyll"
require "json"
require_relative "../_plugins/cv_publications"
site = Jekyll::Site.new(Jekyll.configuration("source" => File.expand_path("..", __dir__), "quiet" => true))
site.read
Regia::CvPublications.new.generate(site)
puts JSON.generate(site.data.fetch("cv").fetch("cv"))
