export type ParsedTransaction = {
    amount: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    tags: string[];
    installments?: number;
};

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Alimentação': ['almoço', 'jantar', 'lanche', 'ifood', 'mercado', 'restaurante', 'café', 'padaria', 'pizza', 'burger', 'açaí', 'fome'],
    'Transporte': ['uber', '99', 'taxi', 'onibus', 'ônibus', 'metrô', 'trem', 'gasolina', 'posto', 'estacionamento', 'pedagio', 'pedágio', 'carro', 'moto'],
    'Lazer': ['cinema', 'filme', 'jogo', 'steam', 'psn', 'xbox', 'spotify', 'netflix', 'amazon', 'bar', 'cerveja', 'festa', 'show', 'livro'],
    'Saúde': ['farmacia', 'farmácia', 'remedio', 'remédio', 'medico', 'médico', 'consulta', 'exame', 'dentista', 'academia', 'suplemento', 'whey'],
    'Moradia': ['aluguel', 'luz', 'agua', 'água', 'internet', 'vivo', 'claro', 'tim', 'condominio', 'condomínio', 'iptu', 'gas', 'gás', 'limpeza'],
    'Educação': ['curso', 'faculdade', 'escola', 'livro', 'material', 'udemy', 'alura'],
    'Salário': ['salario', 'salário', 'holerite', 'freela', 'pix recebido', 'deposito', 'depósito', 'remuneração', 'pagamento']
};

// Helper to detect category from text
export function detectCategory(text: string): string {
    const lowerText = text.toLowerCase();

    // Check for "Income" keywords first
    if (CATEGORY_KEYWORDS['Salário'].some(k => lowerText.includes(k))) {
        return 'Salário';
    }

    // Check other categories
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (cat === 'Salário') continue;

        if (keywords.some(k => lowerText.includes(k))) {
            return cat;
        }
    }

    return '';
}

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

    // 3. Extract Installments (10x, 12x)
    const installmentMatch = text.match(/(\d+)x/i);
    if (installmentMatch) {
        const count = parseInt(installmentMatch[1]);
        if (count > 1 && count <= 48) { // Limit reasonable installments
            result.installments = count;
            text = text.replace(installmentMatch[0], '').trim();
        }
    }

    // 4. Detect Category & Type based on keywords
    result.category = detectCategory(text);
    if (result.category === 'Salário') {
        result.type = 'income';
    }

    // 5. Description is what's left
    // Clean up extra spaces
    result.description = text.replace(/\s+/g, ' ').trim();

    // Capitalize first letter
    if (result.description) {
        result.description = result.description.charAt(0).toUpperCase() + result.description.slice(1);
    }

    return result;
}
