# frozen_string_literal: true

require "bibtex"
require "cgi"

module Regia
  # Resolve bibliography-backed research entries without copying public metadata.
  # Custom CV-only work is deliberately excluded from the public bibliography.
  class CvPublications < Jekyll::Generator
    safe true
    priority :normal

    def generate(site)
      cv = site.data.dig("cv", "cv")
      return unless cv

      scholar = site.config.fetch("scholar")
      path = File.join(site.source, scholar.fetch("source").sub(%r{\A/}, ""), scholar.fetch("bibliography"))
      bibliography = BibTeX.open(path)
      bibliography.replace_strings if scholar["replace_strings"]
      bibliography.join if scholar["replace_strings"] && scholar["join_strings"]
      sections = cv.fetch("sections")
      seen = []
      ["First-Author Research", "Other Research"].each do |section|
        sections.fetch(section).each do |item|
          if item["bib_key"]
            key = item.fetch("bib_key")
            raise "Duplicate CV bibliography reference: #{key}" if seen.include?(key)
            seen << key
            raw_entry = bibliography[key]
            raise "Unknown CV bibliography reference: #{key}" unless raw_entry
            entry = raw_entry.convert(:latex)
            item["title"] = entry.title.to_s
            item["authors"] = entry.author.map(&:display_order)
            item["year"] = entry.year.to_s
            venue = (entry[:abbr] || entry[:booktitle] || entry[:journal]).to_s
            item["venue"] = venue == "Preprint" ? nil : venue
            item["links"] = publication_links(entry, site)
          end
          item["research"] = true
          title = CGI.escapeHTML(item.fetch("title"))
          title += " (#{CGI.escapeHTML(item['system'])})" if item["system"]
          item["display_title"] = CGI.unescapeHTML(title)
          meta = [item.fetch("role"), [item["venue"], item.fetch("year")].compact.join(" "), item["status"]].compact
          parts = ["**#{title}**", meta.join(" · ")]
          if item["authors"]
            parts << item["authors"].map { |name| name == cv["name"] ? "**#{CGI.escapeHTML(name)}**" : CGI.escapeHTML(name) }.join(", ") + "."
          end
          parts << CGI.escapeHTML(item["contribution"]) if item["contribution"]
          links = item.fetch("links", {})
          parts << links.map { |label, url| "[#{label}](<#{url}>)" }.join(" · ") unless links.empty?
          # Native generic CV sections accept bullet entries, including Markdown.
          item["bullet"] = parts.join("<br>")
        end
      end
      missing = bibliography.entries.keys.map(&:to_s) - seen
      raise "Public bibliography entries missing from CV: #{missing.join(', ')}" unless missing.empty?
    end

    private

    def publication_links(entry, site)
      links = {}
      if entry[:pdf]
        pdf = entry[:pdf].to_s
        links["PDF"] = if pdf.match?(%r{\Ahttps?://})
                         pdf
                       else
                         asset = pdf.start_with?("/") ? pdf : "/assets/pdf/#{pdf}"
                         "#{site.baseurl}#{asset}"
                       end
      end
      links["Publisher"] = entry[:html].to_s if entry[:html]
      links["Code"] = entry[:code].to_s if entry[:code]
      links["arXiv"] = "https://arxiv.org/abs/#{entry[:arxiv]}" if entry[:arxiv]
      links["DOI"] = "https://doi.org/#{entry[:doi]}" if entry[:doi]
      links
    end
  end
end
