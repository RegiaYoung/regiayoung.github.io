# frozen_string_literal: true

require "bibtex"
require "cgi"

module Regia
  # Adapt the shared bibliography to al_folio_cv's native publication fields.
  # Only in-memory site data changes; neither the YAML nor the gem is rewritten.
  class CvPublications < Jekyll::Generator
    safe true
    priority :normal

    def generate(site)
      cv = site.data.dig("cv", "cv")
      return unless cv && cv.fetch("sections").key?("Publications")

      scholar = site.config.fetch("scholar")
      path = File.join(site.source, scholar.fetch("source").sub(%r{\A/}, ""), scholar.fetch("bibliography"))
      bibliography = BibTeX.open(path)
      bibliography.replace_strings if scholar["replace_strings"]
      bibliography.join if scholar["replace_strings"] && scholar["join_strings"]
      entries = bibliography.entries.values.sort_by do |entry|
        [-entry[:year].to_s.to_i, -entry[:month_numeric].to_s.to_i]
      end

      cv["sections"]["Publications"] = entries.map do |raw_entry|
        entry = raw_entry.convert(:latex)
        authors = entry.author.map(&:display_order)
        author_text = authors.map do |name|
          escaped = CGI.escapeHTML(name)
          name == cv["name"] ? "**#{escaped}**" : escaped
        end.join(", ")
        links = publication_links(entry, site)
        venue = entry[:abbr] || entry[:booktitle] || entry[:journal]

        {
          "title" => entry.title.to_s,
          "authors" => authors,
          "publisher" => venue.to_s,
          "releaseDate" => entry.year.to_s,
          "url" => links["arXiv"] || links["DOI"] || links["PDF"] || links["Code"],
          # The pinned native renderer reads summary, not authors.
          "summary" => ["#{author_text}.", links.map { |label, url| "[#{label}](<#{url}>)" }.join(" · ")].join("<br>")
        }
      end
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
      links["Code"] = entry[:code].to_s if entry[:code]
      links["arXiv"] = "https://arxiv.org/abs/#{entry[:arxiv]}" if entry[:arxiv]
      links["DOI"] = "https://doi.org/#{entry[:doi]}" if entry[:doi]
      links
    end
  end
end
