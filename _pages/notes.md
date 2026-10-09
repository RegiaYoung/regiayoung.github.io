---
layout: page
title: Notes
permalink: /notes/
nav: true
nav_order: 3
description: Technical notes and things I have learned along the way.
---

{% for post in site.posts %}

### [{{ post.title }}]({{ post.url | relative_url }})

{{ post.date | date: '%B %d, %Y' }} · {{ post.language_label }}

{{ post.description }}
{% endfor %}
