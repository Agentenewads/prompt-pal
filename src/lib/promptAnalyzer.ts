import type { Suggestion } from "@/components/SuggestionCard";

interface AnalysisResult {
  suggestions: Suggestion[];
  optimizedPrompt: string;
}

const PROMPT_PATTERNS = {
  vague_instructions: /\b(faça|faz|me ajude|ajuda|pode|poderia)\b(?!.*específico|.*exato|.*preciso)/gi,
  missing_context: /^(?!.*(?:você é|tu és|seu papel|sua função|seu objetivo))/i,
  weak_verbs: /\b(tente|talvez|possivelmente|provavelmente|se puder)\b/gi,
  missing_format: /^(?!.*(?:formato|estrutura|retorne|output|saída))/i,
  no_examples: /^(?!.*(?:exemplo|por exemplo|como:|e\.g\.|ex:))/i,
  missing_constraints: /^(?!.*(?:não|nunca|evite|limite|máximo|mínimo))/i,
  tool_call_issues: /<tool>|<function>|tool_call|function_call/i,
  json_structure: /\{[\s\S]*"(?:name|type|function)"[\s\S]*\}/,
};

export function analyzePrompt(prompt: string, objective: string): AnalysisResult {
  const suggestions: Suggestion[] = [];
  let optimizedPrompt = prompt;
  let idCounter = 0;

  const generateId = () => `suggestion-${++idCounter}`;

  // Check for missing role definition
  if (!prompt.toLowerCase().includes("você é") && !prompt.toLowerCase().includes("seu papel")) {
    suggestions.push({
      id: generateId(),
      type: "critical",
      title: "Definição de papel ausente",
      description: "Prompts efetivos começam definindo claramente o papel do agente. Adicione uma introdução como 'Você é um assistente especializado em...'",
      suggestedText: `Você é um assistente de IA especializado. ${prompt}`,
    });
  }

  // Check for vague instructions
  const vagueMatches = prompt.match(PROMPT_PATTERNS.vague_instructions);
  if (vagueMatches && vagueMatches.length > 2) {
    suggestions.push({
      id: generateId(),
      type: "warning",
      title: "Instruções vagas detectadas",
      description: "Use verbos imperativos e instruções diretas ao invés de termos vagos como 'faça', 'pode', 'me ajude'.",
      originalText: vagueMatches.slice(0, 3).join(", "),
      suggestedText: "Execute, Analise, Retorne, Calcule, Gere...",
    });
  }

  // Check for weak verbs
  const weakVerbs = prompt.match(PROMPT_PATTERNS.weak_verbs);
  if (weakVerbs) {
    suggestions.push({
      id: generateId(),
      type: "improvement",
      title: "Verbos fracos encontrados",
      description: "Substitua verbos como 'tente' e 'talvez' por instruções assertivas que garantam comportamento consistente.",
      originalText: weakVerbs.join(", "),
      suggestedText: "sempre, obrigatoriamente, certifique-se de...",
    });
  }

  // Check for missing output format
  if (PROMPT_PATTERNS.missing_format.test(prompt)) {
    suggestions.push({
      id: generateId(),
      type: "improvement",
      title: "Formato de saída não especificado",
      description: "Defina claramente o formato esperado da resposta (JSON, Markdown, lista, etc.) para garantir consistência.",
      suggestedText: "Retorne a resposta no formato JSON com a seguinte estrutura: { ... }",
    });
  }

  // Check for tool call structure
  if (PROMPT_PATTERNS.tool_call_issues.test(prompt) || PROMPT_PATTERNS.json_structure.test(prompt)) {
    if (!prompt.includes("parameters") && !prompt.includes("parâmetros")) {
      suggestions.push({
        id: generateId(),
        type: "critical",
        title: "Estrutura de tool call incompleta",
        description: "Chamadas de tools precisam de definição clara de parâmetros, tipos e descrições para cada campo.",
        suggestedText: '{ "name": "tool_name", "parameters": { "param1": { "type": "string", "description": "..." } } }',
      });
    }
  }

  // Check for missing constraints
  if (PROMPT_PATTERNS.missing_constraints.test(prompt)) {
    suggestions.push({
      id: generateId(),
      type: "info",
      title: "Considere adicionar restrições",
      description: "Definir o que o agente NÃO deve fazer é tão importante quanto definir o que deve fazer. Adicione limites e exceções.",
      suggestedText: "Nunca invente informações. Limite a resposta a 500 palavras. Evite linguagem informal.",
    });
  }

  // Check for missing examples
  if (PROMPT_PATTERNS.no_examples.test(prompt) && prompt.length > 200) {
    suggestions.push({
      id: generateId(),
      type: "improvement",
      title: "Exemplos não encontrados",
      description: "Few-shot prompting (adicionar exemplos) melhora significativamente a qualidade das respostas. Considere adicionar 2-3 exemplos.",
      suggestedText: "Exemplo de entrada: '...' → Exemplo de saída: '...'",
    });
  }

  // Objective-based suggestions
  if (objective) {
    if (objective.toLowerCase().includes("técnic") && !prompt.toLowerCase().includes("técnic")) {
      suggestions.push({
        id: generateId(),
        type: "improvement",
        title: "Alinhar com objetivo técnico",
        description: "Seu objetivo menciona aspectos técnicos, mas o prompt não especifica o nível de tecnicidade esperado.",
        suggestedText: "Responda de forma técnica e precisa, incluindo detalhes de implementação quando relevante.",
      });
    }

    if (objective.toLowerCase().includes("concis") && !prompt.toLowerCase().includes("concis")) {
      suggestions.push({
        id: generateId(),
        type: "improvement",
        title: "Alinhar com objetivo de concisão",
        description: "Seu objetivo menciona respostas concisas, adicione essa instrução explicitamente ao prompt.",
        suggestedText: "Seja direto e conciso. Evite explicações desnecessárias.",
      });
    }
  }

  // Generate optimized prompt
  optimizedPrompt = generateOptimizedPrompt(prompt, suggestions, objective);

  return { suggestions, optimizedPrompt };
}

function generateOptimizedPrompt(original: string, suggestions: Suggestion[], objective: string): string {
  let optimized = original;

  // Add role definition if missing
  if (!original.toLowerCase().includes("você é")) {
    optimized = `Você é um agente de IA altamente especializado.\n\n${optimized}`;
  }

  // Add objective context
  if (objective && !original.includes(objective)) {
    optimized = `## Objetivo\n${objective}\n\n## Instruções\n${optimized}`;
  }

  // Add format section if missing
  if (PROMPT_PATTERNS.missing_format.test(original)) {
    optimized += "\n\n## Formato de Saída\nRetorne a resposta de forma estruturada e clara.";
  }

  // Add constraints section if missing
  if (PROMPT_PATTERNS.missing_constraints.test(original)) {
    optimized += "\n\n## Restrições\n- Não invente informações que não foram fornecidas\n- Mantenha a resposta focada no objetivo";
  }

  return optimized;
}

export function applyIndividualSuggestion(
  prompt: string,
  suggestion: Suggestion
): string {
  if (suggestion.suggestedText && suggestion.originalText) {
    return prompt.replace(suggestion.originalText, suggestion.suggestedText);
  }
  
  if (suggestion.suggestedText && !suggestion.originalText) {
    // For suggestions that add content
    if (suggestion.title.includes("papel") || suggestion.title.includes("role")) {
      return `${suggestion.suggestedText}\n\n${prompt}`;
    }
    return `${prompt}\n\n${suggestion.suggestedText}`;
  }

  return prompt;
}
