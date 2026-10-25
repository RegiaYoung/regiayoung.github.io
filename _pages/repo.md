---
layout: page
permalink: /projects/
title: Projects
description: Open-source work on efficient LLM training and systems.
nav: true
nav_order: 2
---

## Research projects

<div class="research-projects">
{% for project in site.data.repositories.repositories %}
<section class="research-project">
  <h3>{{ project.name }}</h3>
  <p>{{ project.description }}</p>
  <p class="project-result"><strong>Result.</strong> {{ project.result }}</p>
  <p class="project-links"><a href="{{ project.paper }}">Paper · {{ project.venue }}</a> <span aria-hidden="true">·</span> <a href="{{ project.url }}">Code</a></p>
  <p class="project-status">{{ project.status }}</p>
</section>
{% endfor %}
</div>

{% if site.data.repositories.github_users %}

## GitHub profile

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div>

---

{% if site.repo_trophies.enabled %}
{% for user in site.data.repositories.github_users %}
{% if site.data.repositories.github_users.size > 1 %}

  <h4>{{ user }}</h4>
  {% endif %}
  <div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% include repository/repo_trophies.liquid username=user %}
  </div>

---

{% endfor %}
{% endif %}
{% endif %}

{% if site.data.repositories.github_repos %}

## GitHub Repositories

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

[View all repositories on GitHub](https://github.com/RegiaYoung?tab=repositories).

### Code availability

{% for repo in site.data.repositories.repositories %}

- [**{{ repo.name }}**]({{ repo.url }}): {{ repo.status }} [Paper · {{ repo.venue }}]({{ repo.paper }}).
  {% endfor %}
