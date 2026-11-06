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
          "publisher" => cv.fetch("publication_status", {}).fetch(entry.key.to_s, venue.to_s),
          "releaseDate" => entry.year.to_s,
          "url" => links["Publisher"] || links["DOI"] || links["arXiv"] || links["PDF"] || links["Code"],
          # The pinned native renderer reads summary, not authors.
          "summary" => ["#{author_text}.", links.map { |label, url| "[#{label}](<#{url}>)" }.join(" · ")].join("<br>")
        }
      end
      # CV-only manuscripts reuse the native publication layout without appearing
      # in the public bibliography, homepage selections, or Publications page.
      extras = cv.fetch("additional_publications", []).map do |item|
        authors = item.fetch("authors", [])
        author_text = if authors.empty?
                        CGI.escapeHTML(item.fetch("author_note"))
                      else
                        authors.map { |name| name == cv["name"] ? "**#{CGI.escapeHTML(name)}**" : CGI.escapeHTML(name) }.join(", ") + "."
                      end
        item.merge("authors" => authors, "summary" => author_text)
      end
      cv["sections"]["Publications"] = extras + cv["sections"]["Publications"]
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
