In this folder, each table of our MySQL 8 database is documented.

The most important tables are:

- charts: stores standalone charts that are published at https://ourworldindata.org/grapher/SLUG. Charts are rendered as data pages on our website.
- chart_configs: stores the actual JSON configuration for all charts that we have anywhere in our system.
- chart_slug_redirects: redirects for charts - this table needs to be taken into account when looking up charts by slug as several slugs can point to one standalone chart
- dods: Our Detail-on-Demands entry that our website uses to explain many technical terms when hovering over them
- explorers: Our data explorers (collections of multiple charts with drop-downs to switch between them), published at https://ourworldindata.org/explorers/SLUG
- multi_dim_data_pages: Our new multi-dim charts that also live under https://ourworldindata.org/grapher/SLUG. Similar to explorers in functionality but support data page features.
- origins: Describe data sources (e.g. a UN division, the WHO, an academic group that published a paper)
- posts_gdocs: The heart of our CMS. This table stores practically all the text on our website. The original text is written in Google Docs using ArchieML. This table contains the ArchieML content serialized to JSON.
- posts: legacy wordpress content. This is almost entirely obsolete. Only use this table when you have a good reason - by default you want to query posts_gdocs instead.
- redirects: generic redirects. This table is important to take into account when matching posts_gdocs by slug as several aliases can point to the same gdoc content
- tags: Our tags that also form the navigational structure of our website (3-level hierarchy)
- variables: Information about all the time series we have data for and that can be used to create charts. Aka Indicators. The data is stored separately in JSON files, outside the DB. The logical structure of every variable is that it is a time series with time and entity (usually country) as the dimensions.
