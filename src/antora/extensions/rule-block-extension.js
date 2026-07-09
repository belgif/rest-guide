/**
 * Antora / asciidoctor.js extension for the custom [rule, <ruleId>] block:
 *   - Named "rule", used on example blocks (====)
 *   - First positional attribute is the ruleId
 *   - Generates anchor id="rule-<ruleId>" and reftext="[<ruleId>]"
 *   - Prepends "Rule: " to the title and appends a self-link <<rule-<ruleId>>>
 *   - Applies roles "exampleblock rule" so existing CSS keeps working
 *
 * A postprocessor adds data-pagefind-weight="10" to every rule block title element
 * so that rule IDs (already present as "[ruleId]" link text in the title) are ranked
 * higher in pagefind search results.
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
      // Stamp data-pagefind-weight on the title element of every rule block so that
      // the "[ruleId]" link text already present there is ranked higher in search.
      return output.replace(/<div class="title">Rule:/g, '<div class="title" data-pagefind-weight="10">Rule:')
    })
  })
}
