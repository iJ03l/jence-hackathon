<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap | Jence</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #ccc;
            background-color: #0a0a0a;
            margin: 0;
            padding: 40px;
          }
          a {
            color: #3b82f6;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          table {
            border: none;
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
            background: #171717;
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background-color: #262626;
            color: #fff;
            text-align: left;
            padding: 14px;
            font-weight: 500;
          }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #262626;
          }
          tr:last-child td {
            border-bottom: none;
          }
          h1 {
            color: #fff;
            margin-top: 0;
            font-size: 24px;
          }
          h1 img {
            height: 32px;
            vertical-align: middle;
            margin-right: 12px;
          }
          p {
            color: #a3a3a3;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1><img src="/logo.svg" alt="Jence Logo" /> XML Sitemap</h1>
        <p>This is the XML Sitemap for Jence.xyz. It is intended to be consumed by search engines like Google.</p>
        <p>Number of URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Priority</th>
              <th>Change Frequency</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td><xsl:value-of select="sitemap:priority"/></td>
                <td><xsl:value-of select="sitemap:changefreq"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
