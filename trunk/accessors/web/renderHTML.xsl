<!-- XSL transformer to convert level one accessors into HTML for display in a browser -->
<!-- Author: Edward A. Lee. -->
<xsl:stylesheet
  version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- set output mode as html -->
  <xsl:output method="html" media-type="text/html" indent="no" omit-xml-declaration="yes"/>
  <xsl:template match="/class">
    <html>
    <head>
    <meta http-equiv="content-type" content="text/html"/>
    </head>
	<body>
      <h1> Accessor Class Name: <xsl:value-of select="@name"/> </h1>
      <p>
        <!-- NOTE: disable-output-escaping does not work with Firefox, so HTML is not rendered. -->
        <!-- There appears to be no fix except to not use Firefox. -->
        <xsl:value-of select="documentation" disable-output-escaping="yes"/>
      <!-- Get documentation for each input. -->
      <table border="1">
      <tr bgcolor="#9acd32">
        <th>Input</th>
        <th>Description</th>
      </tr>
        <xsl:for-each select="input">
        <tr>
          <td><xsl:value-of select="@name"/></td>
          <td><xsl:value-of select="@description"/></td>
        </tr>
        </xsl:for-each>
      </table>
      <!-- Get documentation for each output. -->
      <table border="1">
      <tr bgcolor="#9acd32">
        <th>Output</th>
        <th>Description</th>
      </tr>
        <xsl:for-each select="output">
        <tr>
          <td><xsl:value-of select="@name"/></td>
          <td><xsl:value-of select="@description"/></td>
        </tr>
        </xsl:for-each>
      </table>
      </p>
      <p>
      <b>NOTES:</b>
      <ul>
      <li> See <a href="http://terraswarm.org/accessors">further information about accessors</a>.</li>
      <li> HTML embedded in the documentation doesn't render in Firefox. Use another browser or suggest a solution. </li>
      </ul>
      </p>
    </body>
    </html>
  </xsl:template>
</xsl:stylesheet>