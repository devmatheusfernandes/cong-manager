// Lista de publicadores para mapeamento de nomes para IDs
export interface Publicador {
  id: string;
  nome: string;
}

export const PUBLICADORES_LIST: Publicador[] = [
  { id: "0627e112-ff21-4c4c-9020-c2e9336b23d1", nome: "Deise" },
  { id: "0ecb71fe-628d-4fee-b8b3-3e8a4fc27d2f", nome: "Teresinha" },
  { id: "179d12c4-8132-481f-a6f5-8e770c90c3ad", nome: "Samara" },
  { id: "198b89ab-3c18-4a6f-94eb-ab21a7fbc52c", nome: "Joel" },
  { id: "1eaa92e7-7144-4d7c-96a6-240b1a4e2986", nome: "Eliseu" },
  { id: "29fae5dc-a41c-429d-85df-3e8ffbdee2d7", nome: "Adna" },
  { id: "2af9e655-c3c4-415b-8324-f7e172af585a", nome: "Arthur" },
  { id: "2b24c2b2-0478-4ffa-be92-f65540b8efe9", nome: "Silvana" },
  { id: "36d686d5-4f10-43de-980d-1ab85b49c8ab", nome: "Vilson" },
  { id: "43df4230-538b-4cd0-84fc-28670c034af7", nome: "Célio" },
  { id: "4742fff8-1bcf-41cd-baf9-84a489623381", nome: "Isolde" },
  { id: "4bfb17f3-140c-4e13-a05d-928e13de4856", nome: "Daniele" },
  { id: "523ce8bd-e870-4c20-9416-1821c5153234", nome: "Milene" },
  { id: "5d11c0e9-be3d-43fa-bc67-e3a475bef0e8", nome: "José" },
  { id: "6563c4f4-8f80-4f2f-956f-1ee82becd3b2", nome: "Leunice" },
  { id: "68cb9d4f-2161-4a0c-9fbc-de163726b710", nome: "Oscar" },
  { id: "6b12b534-c79e-4ac9-b75a-59d83aeb708e", nome: "Juliane" },
  { id: "6bd9ef8e-483d-4629-aeb5-d4dd989ee849", nome: "Volmir" },
  { id: "72479d08-ca8b-4ab8-865b-68e8fa720328", nome: "Helmut" },
  { id: "7624f826-c548-425e-bc60-4f8e4b23ffb5", nome: "Mikael" },
  { id: "77125e22-ac86-4ca5-a663-29a7a3640684", nome: "Samuel" },
  { id: "847f29c9-4243-4e4d-82d3-1e0aef8ece9c", nome: "Sebastiana" },
  { id: "9718fefd-6029-4fd4-bfce-8d72345d9825", nome: "Cleria" },
  { id: "9d02275b-04f4-4e5a-96f5-edbc21fc62f3", nome: "Antônio" },
  { id: "a0c54f9d-6a93-48c3-b931-022c4c0f6248", nome: "Cleito" },
  { id: "a2dc9e52-de25-4d38-bbda-c3965f031ea7", nome: "Loni" },
  { id: "aa46c264-36ce-4d17-99ce-a41192874a5e", nome: "Andrea" },
  { id: "ad215358-9a5b-4589-8347-59af6674022b", nome: "Marcos" },
  { id: "aea78c4d-2662-4cb8-bd5b-e4b5fa427d69", nome: "Rose" },
  { id: "bc268a45-97dc-4c16-a719-e2bbe04bf4d2", nome: "Matheus Fernandes" },
  { id: "c8637955-3eac-4d70-8fc9-21ab9dcace4f", nome: "Paulo" },
  { id: "d8b6b6ed-470d-4b13-92e5-4a1333feb02b", nome: "Célia" },
  { id: "e1bb98ac-e8df-4908-9734-95eb00e8bb10", nome: "Marta" },
  { id: "f210d291-952f-4b7f-9b50-2ad71bae24ce", nome: "Bernardo" },
  { id: "f36586bf-74d5-4962-beac-9e9412e9475c", nome: "Maria" },
];

// Função para buscar ID por nome (busca exata e aproximada)
export function findPublicadorByName(nome: string): Publicador | null {
  if (!nome || typeof nome !== "string") return null;

  const nomeNormalizado = nome.trim().toLowerCase();

  // Busca exata primeiro
  const exactMatch = PUBLICADORES_LIST.find(
    (p) => p.nome.toLowerCase() === nomeNormalizado
  );

  if (exactMatch) return exactMatch;

  // Busca aproximada (contém o nome)
  const partialMatch = PUBLICADORES_LIST.find(
    (p) =>
      p.nome.toLowerCase().includes(nomeNormalizado) ||
      nomeNormalizado.includes(p.nome.toLowerCase())
  );

  return partialMatch || null;
}

// Função para criar mapa de nomes para IDs (para uso no prompt)
export function createPublicadoresMap(): Record<string, string> {
  const map: Record<string, string> = {};
  PUBLICADORES_LIST.forEach((p) => {
    map[p.nome] = p.id;
  });
  return map;
}

// String formatada para incluir no prompt do Gemini
export const PUBLICADORES_PROMPT_LIST = PUBLICADORES_LIST.map(
  (p) => `"${p.nome}": "${p.id}"`
).join(",\n  ");
