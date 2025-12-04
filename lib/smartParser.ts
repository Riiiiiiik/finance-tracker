export type ParsedTransaction = {
    amount: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    tags: string[];
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Alimentação': ['almoço', 'jantar', 'lanche', 'ifood', 'mercado', 'restaurante', 'café', 'padaria', 'pizza', 'burger', 'açaí', 'fome'],
    'Transporte': ['uber', '99', 'taxi', 'onibus', 'metrô', 'trem', 'gasolina', 'posto', 'estacionamento', 'pedagio', 'carro', 'moto'],
    'Lazer': ['cinema', 'filme', 'jogo', 'steam', 'psn', 'xbox', 'spotify', 'netflix', 'amazon', 'bar', 'cerveja', 'festa', 'show', 'livro'],
    'Saúde': ['farmacia', 'remedio', 'medico', 'consulta', 'exame', 'dentista', 'academia', 'suplemento', 'whey'],
    'Moradia': ['aluguel', 'luz', 'agua', 'internet', 'vivo', 'claro', 'tim', 'condominio', 'iptu', 'gas', 'limpeza'],
    'Educação': ['curso', 'faculdade', 'escola', 'livro', 'material', 'udemy', 'alura'],
    'Salário': ['salario', 'pagamento', 'freela', 'pix recebido', 'deposito']
};

export function parseSmartInput(input: string): ParsedTransaction {
    let text = input.trim();
    const result: ParsedTransaction = {
        amount: '',
        description: '',
        category: '',
        type: 'expense',
        tags: []
    };

    // 1. Extract Amount (R$ 50,00, 50.00, 50)
    // Regex looks for numbers, optionally with decimals/commas
    const amountMatch = text.match(/R?\$?\s?(\d+([.,]\d{1,2})?)/);
    if (amountMatch) {
        // Normalize 50,00 to 50.00
        let amountStr = amountMatch[1].replace(',', '.');
        result.amount = amountStr;

        // Remove amount from text to avoid confusion
        text = text.replace(amountMatch[0], '').trim();
    }

    // 2. Extract Tags (#tag)
    const tagMatches = text.match(/#\w+/g);
    if (tagMatches) {
        result.tags = tagMatches.map(t => t.replace('#', ''));
        // Remove tags from text
        tagMatches.forEach(tag => {
            text = text.replace(tag, '').trim();
        });
    }

    // 3. Detect Category & Type based on keywords
    const lowerText = text.toLowerCase();

    // Check for "Income" keywords first to set Type
    if (CATEGORY_KEYWORDS['Salário'].some(k => lowerText.includes(k))) {
        result.type = 'income';
        result.category = 'Salário';
    } else {
        // Check other categories
        for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (cat === 'Salário') continue;

            if (keywords.some(k => lowerText.includes(k))) {
                result.category = cat;
                break; // Stop at first match
            }
        }
    }

    // 4. Description is what's left
    // Clean up extra spaces
    result.description = text.replace(/\s+/g, ' ').trim();

    // Capitalize first letter
    if (result.description) {
        result.description = result.description.charAt(0).toUpperCase() + result.description.slice(1);
    }

    return result;
}
