<!-- XSL transformer to convert level one accessors into HTML for display in a browser -->
<!-- Author: Edward A. Lee and Patricia Derler -->
<xsl:stylesheet
  version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
>
  <!-- set output mode as html -->
  <xsl:output method="html" media-type="text/html" indent="no" omit-xml-declaration="yes"/>
  <xsl:template match="/class">
    <html>
    <head>
    <meta http-equiv="content-type" content="text/html"/>
    <script src="basicFunctions.js"/>
    <script src="browserHost.js"/>
    <script>
// Create a closure to contain the context in which to invoke the accessor methods.
function <xsl:value-of select="@name"/>Closure() {
      // Define a variable for each input and output of the accessor.
      // The value of the variable is simply the name of the input or output as a string.
      <xsl:for-each select="input">
        var <xsl:value-of select="@name"/> = '<xsl:value-of select="@name"/>';
      </xsl:for-each>
      <xsl:for-each select="output">
        var <xsl:value-of select="@name"/> = '<xsl:value-of select="@name"/>';
      </xsl:for-each>
      // Accessor can override the above methods.
      <xsl:value-of select="script" disable-output-escaping="no"/>
      // Return a data structure with methods
      return {
        initialize: function() {
          try {
            initialize();
          } catch (e) {
            alert(e);
          }
        },
        fire: function() {
          try {
            fire();
          } catch (e) {
            alert(e);
          }
        },
        wrapup: function() {
          try {
            wrapup();
          } catch (e) {
            alert(e);
          }
        }}
      };
// Create a top-level variable whose name matches the accessor instance name.
var <xsl:value-of select="@name"/> = <xsl:value-of select="@name"/>Closure();
    </script>
    </head>
	<body>
      <h1> Accessor Class Name: <xsl:value-of select="@name"/> </h1>
      <p>
        <!-- NOTE: disable-output-escaping does not work with Firefox, so HTML is not rendered. -->
        <!-- There appears to be no fix except to not use Firefox. -->
        <xsl:value-of select="documentation" disable-output-escaping="yes"/>
      </p>
      <!-- Get documentation for each input. -->
      <xsl:choose>
        <xsl:when test="input">
          <h2>Inputs</h2>
          <table border="1">
          <tr bgcolor="#9acd32">
            <th>Input</th>
            <th>Type</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
            <xsl:for-each select="input">
            <tr>
              <td><xsl:value-of select="@name"/></td>
              <td><xsl:value-of select="@type"/></td>
              <xsl:variable name="value" select="@value"/>
              <td><input>
                <xsl:attribute name="id">
                  <xsl:value-of select="@name"/><xsl:text>Input</xsl:text>
                </xsl:attribute>
                <xsl:attribute name="name">
                  <xsl:value-of select="@name"/>
                </xsl:attribute>
                <xsl:attribute name="value">
                  <xsl:value-of select="@value"/>
                </xsl:attribute>
              </input></td>
              <td><xsl:value-of select="@description"/></td>
            </tr>
            </xsl:for-each>
          </table>
        </xsl:when>
        <xsl:otherwise>
          <h2>There are no inputs.</h2>
        </xsl:otherwise>
      </xsl:choose>
      <!-- Get documentation for each output. -->
      <xsl:choose>
        <xsl:when test="output">
          <h2>Outputs</h2>
          <table border="1">
            <tr bgcolor="#9acd32">
            <th>Output</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
            <xsl:for-each select="output">
            <tr>
              <td><xsl:value-of select="@name"/></td>
              <td><div style="color:#aaaaaa">
                <xsl:attribute name="id">
                  <xsl:value-of select="@name"/>
                </xsl:attribute>
              output goes here
              </div></td>
              <td><xsl:value-of select="@description"/></td>
            </tr>
            </xsl:for-each>
          </table>
        </xsl:when>
        <xsl:otherwise>
          <h2>There are no outputs.</h2>
        </xsl:otherwise>
      </xsl:choose>
      <h2>Actions</h2>
      <p>
      <input id="initializeButton" type="button" value="initialize">
        <xsl:attribute name="onclick">
          <xsl:value-of select="@name"/>.initialize();
        </xsl:attribute>
      </input>
      <input id="fireButton" type="button" value="fire">
        <xsl:attribute name="onclick">
          <xsl:value-of select="@name"/>.fire();
        </xsl:attribute>
      </input>
      <input id="wrapupButton" type="button" value="wrapup">
        <xsl:attribute name="onclick">
          <xsl:value-of select="@name"/>.wrapup();
        </xsl:attribute>
      </input>
      </p>
      <h2>Notes and Limitations</h2>
      <p>
      <ul>
      <li> See <a href="http://terraswarm.org/accessors">further information about accessors</a>.</li>
      <li> The action buttons above are placeholders only. This is a mockup of browser swarmlet host.</li>
      <li> HTML embedded in the documentation doesn't render in Firefox. Use another browser or suggest a solution. </li>
      </ul>
      </p>
    </body>
    </html>
  </xsl:template>
</xsl:stylesheet>