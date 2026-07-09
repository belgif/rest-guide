/**
 * Antora / asciidoctor.js extension for the custom [rule, <ruleId>] block:
 *   - Named "rule", used on example blocks (====)
 *   - First positional attribute is the ruleId
 *   - Generates anchor id="rule-<ruleId>" and reftext="[<ruleId>]"
 *   - Prepends "Rule: " to the title and appends a self-link <<rule-<ruleId>>>
 *   - Applies roles "exampleblock rule" so existing CSS keeps working
 *
 * A postprocessor transforms every rule block's title element:
 *   - Moves id="rule-<ruleId>" from the outer wrapper div to the title element
 *   - Changes the title element from <div> to <h6> so pagefind's sub-result
 *     system (which only anchors to h1-h6 elements) links search results
 *     directly to the rule's own anchor (#rule-<ruleId>)
 *   - Adds data-pagefind-weight="10" to boost the rule ID in search rankings
 */
module.exports.register = function (registry) {
  registry.block('rule', function () {
    const self = this
    self.onContext('example')
    self.positionalAttributes(['ruleId'])
    self.process(function (parent, reader, attrs) {
      const ruleId = attrs['ruleId']
      if (!ruleId) {
        throw new Error(`rule block is missing its rule identifier argument (line ${reader.$cursor_line_number()})`)
      }
      delete attrs['ruleId']
      const ruleAnchor = `rule-${ruleId}`
      attrs['id'] = ruleAnchor
      attrs['reftext'] = `[${ruleId}]`
      const title = attrs['title'] || ''
      attrs['title'] = `Rule: ${title} <<${ruleAnchor}>>`
      attrs['role'] = 'exampleblock rule'
      // Using open block with exampleblock style avoids bullet-list parse errors
      return self.createBlock(parent, 'open', reader.readLines(), attrs)
    })
  })

  registry.postprocessor(function () {
    const self = this
    self.process(function (document, output) {
      // Move id from the outer wrapper div to the title element, changing it from
      // <div> to <h6>. pagefind's sub-result system only anchors to h1-h6 elements,
      // so this makes search results link directly to the rule's own anchor.
      // data-pagefind-weight boosts the title text (incl. "[ruleId]") in search rankings.
      return output.replace(
        /<div id="(rule-[^"]+)" class="openblock exampleblock rule">\n<div class="title">([^\n]*)<\/div>/g,
        (match, ruleId, titleContent) =>
          `<div class="openblock exampleblock rule">\n<h6 id="${ruleId}" class="title" data-pagefind-weight="10">${titleContent}</h6>`
      )
    })
  })
}
