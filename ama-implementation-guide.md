# Implémentation AMA (Ask Me Anything) avec LLM

## Objectif

Transformer la FAQ statique (20 questions × 30 langues) en un système intelligent où l'utilisateur peut poser n'importe quelle question. Le LLM utilise :
1. Le contenu de notre FAQ comme contexte prioritaire
2. Ses connaissances générales pour les questions blockchain/crypto non couvertes

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Champ de saisie "Posez votre question..."        │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Réponse du LLM                                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  FAQ statique (questions fréquentes cliquables)   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   API Route (Backend)                   │
│                                                         │
│  1. Reçoit la question                                  │
│  2. Construit le prompt avec FAQ_CONTEXT                │
│  3. Appelle Groq API                                    │
│  4. Retourne la réponse                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      Groq API                           │
│              (Llama 3.3 70B Versatile)                  │
└─────────────────────────────────────────────────────────┘
```

## Choix technique : Groq

### Pourquoi Groq ?

| Critère | Groq |
|---------|------|
| **Coût** | Gratuit (≈6000 req/jour) |
| **Vitesse** | Ultra rapide (<1s) |
| **Modèle** | Llama 3.3 70B (excellent) |
| **Multilingue** | ✅ 30+ langues supportées |
| **API** | Compatible OpenAI SDK |

### Alternatives si besoin

- **Google Gemini** : 1500 req/jour gratuit, très bon multilingue
- **OpenRouter** : Accès à plusieurs modèles gratuits
- **Cloudflare Workers AI** : 10k req/jour si déjà sur Cloudflare

## Configuration

### 1. Créer un compte Groq

1. Aller sur https://console.groq.com
2. Créer un compte (gratuit)
3. Générer une API Key dans "API Keys"

### 2. Variables d'environnement

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Implémentation

### Contexte FAQ (une seule langue suffit)

> **IMPORTANT** : La FAQ peut être maintenue **uniquement en anglais**. Le LLM détecte automatiquement la langue de l'utilisateur et répond dans cette langue, même si le contexte est en anglais.

Créer un fichier `faq-context.ts` :

```typescript
export const FAQ_CONTEXT = `
You are the helpful assistant for [NOM DU SITE], a blockchain application.

## INSTRUCTIONS
- ALWAYS respond in the same language as the user's question
- Use the FAQ below as your primary source for questions about our product
- For general blockchain/crypto questions (UTXO, mining, wallets, etc.), use your knowledge
- Be concise but complete
- If you don't know something specific about our product, say so

## FAQ

Q: How do I create a wallet?
A: To create a wallet, click on the "Create Wallet" button on the homepage. You will be guided through a secure process to generate your keys. Make sure to backup your seed phrase in a safe place.

Q: What are the transaction fees?
A: Our platform uses Bitcoin's native fee structure. Fees vary based on network congestion. We recommend using our fee estimator to choose between fast, medium, or slow confirmation times.

Q: Is my data secure?
A: Yes. All private keys are encrypted locally on your device. We never have access to your keys or funds. The application is fully non-custodial.

Q: What is ZeldHash?
A: ZeldHash is a protocol that rewards users for creating Bitcoin transactions with aesthetically pleasing transaction IDs (TXIDs) that start with leading zeros. It gamifies the mining process.

[... AJOUTER TOUTES LES QUESTIONS ICI ...]

## END OF FAQ
`;
```

### API Route

Créer une route API (exemple Remix/Next.js) :

```typescript
// app/routes/api.ask.ts (Remix)
// ou pages/api/ask.ts (Next.js)

import { FAQ_CONTEXT } from "~/lib/faq-context";

export async function action({ request }: { request: Request }) {
  const { question } = await request.json();

  // Validation basique
  if (!question || question.length > 500) {
    return Response.json(
      { error: "Question invalide" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: FAQ_CONTEXT },
            { role: "user", content: question },
          ],
          temperature: 0.3, // Plus factuel, moins créatif
          max_tokens: 800,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || "Désolé, je n'ai pas pu répondre.";

    return Response.json({ answer });

  } catch (error) {
    console.error("AMA Error:", error);
    return Response.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
```

### Composant Frontend

```tsx
// components/AskMeAnything.tsx

import { useState } from "react";

export function AskMeAnything() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setAnswer(data.answer);
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ama-container">
      <form onSubmit={handleSubmit} className="ama-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything... / Posez votre question..."
          disabled={loading}
          maxLength={500}
          className="ama-input"
        />
        <button type="submit" disabled={loading || !question.trim()} className="ama-button">
          {loading ? "..." : "→"}
        </button>
      </form>

      {error && <div className="ama-error">{error}</div>}

      {answer && (
        <div className="ama-answer">
          {answer}
        </div>
      )}
    </div>
  );
}
```

### Styles suggérés (CSS/Tailwind)

```css
.ama-container {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.ama-form {
  display: flex;
  gap: 0.5rem;
}

.ama-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.ama-button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.ama-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ama-answer {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.6;
}

.ama-error {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  color: #c00;
  border-radius: 8px;
}
```

## Gestion multilingue

### Ce qui est automatique

- Le LLM détecte la langue de la question
- Il répond dans la même langue
- Il "traduit" mentalement le contexte FAQ anglais

### Exemples testés

| Question utilisateur | Langue FAQ | Réponse |
|---------------------|------------|---------|
| "Comment créer un wallet ?" | Anglais | Français ✅ |
| "ما هو UTXO؟" (Qu'est-ce qu'un UTXO ?) | Anglais | Arabe ✅ |
| "手数料はいくらですか？" (Quels sont les frais ?) | Anglais | Japonais ✅ |
| "מה זה ZeldHash?" | Anglais | Hébreu ✅ |

### Placeholder multilingue suggéré

```typescript
const placeholders = [
  "Ask me anything...",
  "Posez votre question...",
  "质问...",
  "اسألني أي شيء...",
];

// Rotation aléatoire ou basée sur la locale du navigateur
```

## Limites et considérations

### Limites Groq (gratuit)

- ~6000 requêtes/jour
- 6000 tokens/minute
- Suffisant pour un site avec trafic modéré

### Si dépassement des limites

Options :
1. **Passer au plan payant Groq** : très peu cher
2. **Ajouter du caching** : mettre en cache les questions fréquentes
3. **Rate limiting côté client** : limiter à X questions/utilisateur/heure

### Caching simple (optionnel)

```typescript
const cache = new Map<string, { answer: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 heure

function getCachedAnswer(question: string): string | null {
  const normalized = question.toLowerCase().trim();
  const cached = cache.get(normalized);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.answer;
  }
  return null;
}

function setCachedAnswer(question: string, answer: string) {
  const normalized = question.toLowerCase().trim();
  cache.set(normalized, { answer, timestamp: Date.now() });
}
```

## Checklist de déploiement

- [ ] Compte Groq créé
- [ ] API Key générée et ajoutée aux variables d'env
- [ ] FAQ complète ajoutée dans `FAQ_CONTEXT`
- [ ] API route implémentée
- [ ] Composant frontend intégré
- [ ] Tests multilingues effectués
- [ ] Monitoring des erreurs en place

## Ressources

- Documentation Groq : https://console.groq.com/docs
- Modèles disponibles : https://console.groq.com/docs/models
- Status Groq : https://status.groq.com
