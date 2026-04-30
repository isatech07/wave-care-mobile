const API_BASE_URL = 'https://example.com/api';

export async function getProdutosMock() {
  const response = await fetch(`${API_BASE_URL}/produtos`);
  return response.json();
}

export async function getEstacoesMock() {
  return Promise.resolve([
    { id: 1, nome: 'verao' },
    { id: 2, nome: 'outono' },
    { id: 3, nome: 'inverno' },
    { id: 4, nome: 'primavera' },
  ]);
}
