---
layout: page
title: Repo
permalink: /repo/
nav: true
nav_order: 2
description: Research code, implementations, and reproducibility resources.
---

{% for repo in site.data.repositories.repositories %}

## [{{ repo.name }}]({{ repo.url }})

{{ repo.description }}

{{ repo.status }}

[Repository]({{ repo.url }}) · [Paper · {{ repo.venue }}]({{ repo.paper }})

---

{% endfor %}

More on [GitHub](https://github.com/RegiaYoung).
