# Site-owned portrait adapter; keep the native CV renderer and sections intact.
require "nokogiri"
Jekyll::Hooks.register :pages, :post_render do |page|
  next unless page.data["layout"] == "cv" && page.data["cv_portrait"]
  doc = Nokogiri::HTML(page.output)
  card = doc.at_css(".cv > .card")
  next unless card
  card["class"] = "#{card['class']} cv-contact-with-photo"
  photo = Nokogiri::XML::Node.new("img", doc)
  photo["src"] = "#{page.site.baseurl}#{page.data['cv_portrait']}"
  photo["alt"] = "Ruijia Yang"
  photo["class"] = "cv-portrait"
  photo["width"] = "90"
  photo["height"] = "120"
  card.children.first.add_previous_sibling(photo)
  page.output = doc.to_html
end
