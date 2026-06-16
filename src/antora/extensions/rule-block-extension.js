/**
 * Antora / asciidoctor.js extension for the custom [rule, <ruleId>] block.
 *
 * Replicates the behaviour of the Java RuleBlock AsciidoctorJ extension:
 *   - Named "rule", used on example blocks (====)
 *   - First positional attribute is the ruleId
 *   - Generates anchor id="rule-<ruleId>" and reftext="[<ruleId>]"
 *   - Prepends "Rule: " to the title and appends a self-link <<rule-<ruleId>>>
 *   - Applies roles "exampleblock rule" so existing CSS keeps working
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
      // The Lunr extension indexes rendered page text, not document attributes.
      // Add a hidden marker so the rule ID is part of the HTML text that gets indexed.
      const searchableMarker = [
        '++++',
        `<span class="rule-search-keyword" style="display:none" aria-hidden="true">${ruleId} [${ruleId}]</span>`,
        '++++',
        ''
      ]
      const lines = searchableMarker.concat(reader.readLines())
      // Using open block with exampleblock style avoids bullet-list parse errors
      return self.createBlock(parent, 'open', lines, attrs)
    })
  })
}
