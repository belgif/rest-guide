package be.belgif.restguide.asciidoc.extension;

import org.asciidoctor.ast.Block;
import org.asciidoctor.ast.ContentModel;
import org.asciidoctor.ast.StructuralNode;
import org.asciidoctor.extension.*;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Support for custom "rule" block.
 *
 * Usage:
 *
 * [rule, <ruleId>]
 * ====
 * Rule content
 * ====
 *
 */
@Name("rule")
@Contexts({Contexts.EXAMPLE})
@ContentModel(ContentModel.COMPOUND)
@PositionalAttributes({"ruleId"})
public class RuleBlock extends BlockProcessor {
    private static final Logger LOGGER = Logger.getLogger(RuleBlock.class.getName());

    @Override
    public Object process(StructuralNode parent, Reader reader, Map<String, Object> attributes) {
        var ruleId = (String) attributes.get("ruleId");
        if (ruleId == null) {
            int line = reader.getLineNumber();
            String msg = "Syntax error on line "  + Integer.toString(line) + " : rule block should have a rule identifier as argument";
            throw new RuntimeException(msg);
        }
        attributes.remove("ruleId");
        var ruleAnchor = "rule-" + ruleId;
        attributes.put("id", ruleAnchor);
        attributes.put("reftext", "[" + ruleId + "]");
        String title = (String) attributes.getOrDefault("title", "");
        attributes.put("title", "Rule: " + title +  " <<" + ruleAnchor + ">>");

        // creating block as 'example' type caused parsing errors for bullet lists, so using open block with exampleblock style instead
        attributes.put("role", "exampleblock rule");
        return createBlock(parent, "open", reader.readLines(), attributes);
    }
}
