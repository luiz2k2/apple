# Documentação da API — Gerenciamento de Aparelhos Apple

Documentação oficial da API RESTful para cadastro, consulta, atualização e remoção de aparelhos Apple.

---

## URLs Base

- **Desenvolvimento Local:** `http://localhost:3000`
- **Produção (Vercel):** `https://seu-projeto.vercel.app` *(substituir pela URL gerada no deploy)*

---

## Sumário de Endpoints

| Método | Endpoint | Descrição | Código Sucesso |
|---|---|---|---|
| `GET` | `/api` | Health check da API | `200 OK` |
| `GET` | `/api/aparelhos` | Lista todos os aparelhos | `200 OK` |
| `GET` | `/api/aparelhos/:id` | Busca aparelho por ID | `200 OK` |
| `POST` | `/api/aparelhos` | Cadastra novo aparelho | `201 Created` |
| `PUT` | `/api/aparelhos/:id` | Atualiza aparelho existente | `200 OK` |
| `DELETE` | `/api/aparelhos/:id` | Remove aparelho por ID | `200 OK` |

---

## 1. Verificação da API (Health Check)

Verifica se a API está online e operante.

### Requisição
```http
GET /api HTTP/1.1
Host: localhost:3000
```

### Exemplo cURL
```bash
curl -X GET http://localhost:3000/api
```

### Resposta de Sucesso (`200 OK`)
```json
{
  "sucesso": true,
  "mensagem": "API de Aparelhos Apple funcionando com sucesso!",
  "versao": "1.0.0",
  "timestamp": "2026-09-26T22:15:00.000Z",
  "banco": "conectado"
}
```

---

## 2. Listar Todos os Aparelhos

Retorna a lista completa de aparelhos cadastrados ordenados dos mais recentes para os mais antigos.

### Requisição
```http
GET /api/aparelhos HTTP/1.1
Host: localhost:3000
```

### Exemplo cURL
```bash
curl -X GET http://localhost:3000/api/aparelhos
```

### Resposta de Sucesso (`200 OK`)
```json
[
  {
    "_id": "673cf90a1f2e8b001a123456",
    "marca": "Apple",
    "modelo": "iPhone 15 Pro Max",
    "preco": 8999.90,
    "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium.jpeg",
    "createdAt": "2026-09-26T20:00:00.000Z",
    "updatedAt": "2026-09-26T20:00:00.000Z"
  }
]
```

### Resposta com Lista Vazia (`200 OK`)
```json
[]
```

---

## 3. Buscar Aparelho por ID

Retorna os dados detalhados de um aparelho a partir do seu identificador único MongoDB `_id`.

### Requisição
```http
GET /api/aparelhos/:id HTTP/1.1
Host: localhost:3000
```

### Parâmetros de Rota
- `id` *(string, obrigatório)*: Identificador único (`ObjectId`) do aparelho.

### Exemplo cURL
```bash
curl -X GET http://localhost:3000/api/aparelhos/673cf90a1f2e8b001a123456
```

### Respostas

#### Sucesso (`200 OK`)
```json
{
  "_id": "673cf90a1f2e8b001a123456",
  "marca": "Apple",
  "modelo": "iPhone 15 Pro Max",
  "preco": 8999.90,
  "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium.jpeg",
  "createdAt": "2026-09-26T20:00:00.000Z",
  "updatedAt": "2026-09-26T20:00:00.000Z"
}
```

#### ID em Formato Inválido (`400 Bad Request`)
```json
{
  "sucesso": false,
  "mensagem": "ID do aparelho fornecido é inválido."
}
```

#### Aparelho Não Encontrado (`404 Not Found`)
```json
{
  "sucesso": false,
  "mensagem": "Aparelho não encontrado."
}
```

---

## 4. Cadastrar Novo Aparelho

Cadastra um novo dispositivo Apple no banco de dados.

### Requisição
```http
POST /api/aparelhos HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

### Corpo da Requisição (Body JSON)
| Campo | Tipo | Obrigatório | Descrição / Regra |
|---|---|---|---|
| `marca` | String | Sim | Deve ser "Apple" (insensível a maiúsculas/minúsculas). |
| `modelo` | String | Sim | Nome do modelo (mínimo de 2 caracteres). Ex: "iPhone 16". |
| `preco` | Number | Sim | Valor numérico positivo em Reais. Ex: `5499.90`. |
| `foto` | String | Sim | URL válida da imagem (iniciando em `http://` ou `https://`). |

### Exemplo de Corpo
```json
{
  "marca": "Apple",
  "modelo": "MacBook Air 13 M3",
  "preco": 11499.00,
  "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-202402.jpeg"
}
```

### Exemplo cURL
```bash
curl -X POST http://localhost:3000/api/aparelhos \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Apple",
    "modelo": "MacBook Air 13 M3",
    "preco": 11499.00,
    "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-202402.jpeg"
  }'
```

### Respostas

#### Sucesso no Cadastro (`201 Created`)
```json
{
  "sucesso": true,
  "mensagem": "Aparelho cadastrado com sucesso!",
  "dados": {
    "_id": "673cf90a1f2e8b001a654321",
    "marca": "Apple",
    "modelo": "MacBook Air 13 M3",
    "preco": 11499.00,
    "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-202402.jpeg",
    "createdAt": "2026-09-26T22:16:00.000Z",
    "updatedAt": "2026-09-26T22:16:00.000Z"
  }
}
```

#### Erro de Validação (`400 Bad Request`)
```json
{
  "sucesso": false,
  "mensagem": "O campo 'modelo' é obrigatório e deve ter ao menos 2 caracteres."
}
```

---

## 5. Atualizar Aparelho Existente

Atualiza os dados de um aparelho já existente no sistema.

### Requisição
```http
PUT /api/aparelhos/:id HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

### Parâmetros de Rota
- `id` *(string, obrigatório)*: Identificador único do aparelho.

### Exemplo de Corpo (Body JSON)
```json
{
  "preco": 10999.00
}
```

### Exemplo cURL
```bash
curl -X PUT http://localhost:3000/api/aparelhos/673cf90a1f2e8b001a654321 \
  -H "Content-Type: application/json" \
  -d '{
    "preco": 10999.00
  }'
```

### Respostas

#### Sucesso na Atualização (`200 OK`)
```json
{
  "sucesso": true,
  "mensagem": "Aparelho atualizado com sucesso!",
  "dados": {
    "_id": "673cf90a1f2e8b001a654321",
    "marca": "Apple",
    "modelo": "MacBook Air 13 M3",
    "preco": 10999.00,
    "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-202402.jpeg",
    "createdAt": "2026-09-26T22:16:00.000Z",
    "updatedAt": "2026-09-26T22:20:00.000Z"
  }
}
```

#### Aparelho Não Encontrado (`404 Not Found`)
```json
{
  "sucesso": false,
  "mensagem": "Aparelho não encontrado."
}
```

---

## 6. Excluir Aparelho

Remove definitivamente um aparelho do sistema.

### Requisição
```http
DELETE /api/aparelhos/:id HTTP/1.1
Host: localhost:3000
```

### Parâmetros de Rota
- `id` *(string, obrigatório)*: Identificador único do aparelho.

### Exemplo cURL
```bash
curl -X DELETE http://localhost:3000/api/aparelhos/673cf90a1f2e8b001a654321
```

### Respostas

#### Sucesso na Exclusão (`200 OK`)
```json
{
  "sucesso": true,
  "mensagem": "Aparelho removido com sucesso!"
}
```

#### Aparelho Não Encontrado (`404 Not Found`)
```json
{
  "sucesso": false,
  "mensagem": "Aparelho não encontrado."
}
```

---

## Guia de Teste com Postman ou Insomnia

Para testar as rotas no **Postman** ou **Insomnia**:

1. Crie uma nova requisição configurando o cabeçalho:
   - `Content-Type: application/json`
2. Configure a URL base: `http://localhost:3000` (ou sua URL na Vercel).
3. Utilize os corpos de requisição abaixo:

### Exemplo 1: Cadastrar iPhone 15
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/aparelhos`
- **Body (raw JSON):**
```json
{
  "marca": "Apple",
  "modelo": "iPhone 15",
  "preco": 4999.90,
  "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue.jpeg"
}
```

### Exemplo 2: Cadastrar Apple Watch Ultra 2
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/aparelhos`
- **Body (raw JSON):**
```json
{
  "marca": "Apple",
  "modelo": "Apple Watch Ultra 2",
  "preco": 7999.00,
  "foto": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-watch-ultra-2-black-titanium-oceantape-black.jpeg"
}
```

### Exemplo 3: Testar Rejeição de Marca Concorrente (Erro 400 esperado)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/aparelhos`
- **Body (raw JSON):**
```json
{
  "marca": "Samsung",
  "modelo": "Galaxy S24",
  "preco": 4500.00,
  "foto": "https://exemplo.com/s24.jpg"
}
```

---

## Códigos de Resposta HTTP Utilizados

| Código | Significado | Situação |
|---|---|---|
| `200` | OK | Operação concluída com sucesso (listagem, consulta, edição, exclusão). |
| `201` | Created | Novo aparelho criado com sucesso. |
| `400` | Bad Request | Dados inválidos, ausência de campos obrigatórios ou marca não-Apple. |
| `404` | Not Found | Aparelho com o ID informado não existe no banco de dados. |
| `500` | Internal Server Error | Falha inesperada no servidor ou na conexão com o banco de dados. |
