# Plano de redesign — Diagnóstico MedCEO

## Norte da experiência

Transformar a landing em uma **sala de comando médica**: uma página de decisão, não uma vitrine decorativa. Em cinco segundos, o médico dono de clínica precisa entender que o diagnóstico revela o nível de maturidade da operação, o gargalo prioritário e a próxima decisão antes de tentar crescer mais.

## Diagnóstico do site anterior

- O hero tinha uma tese correta, mas deixava grande parte do primeiro viewport vazia e não usava a fotografia oficial para instalar autoridade.
- Quase todas as seções repetiam o mesmo tratamento escuro, a mesma cadência e os mesmos cards, criando monotonia de template.
- O dourado aparecia como acabamento visual; no sistema MedCEO ele deve marcar critério, nível e ação.
- A jornada explicava muito antes de fazer o visitante se reconhecer na cena central: uma clínica que fatura, mas ainda depende do dono.
- Metadados residuais do Lovable competiam com o título e a descrição oficiais nos mecanismos de busca e compartilhamento.

## Direção de arte

- **Conceito:** rigor clínico + governança executiva.
- **Sensação:** sóbria, precisa, humana e decisiva; premium sem ostentação.
- **Superfícies:** night/navy na abertura e nos momentos de diagnóstico; paper para leitura e contraste narrativo.
- **Acento:** dourado somente em critérios, réguas, níveis, foco e CTA primário.
- **Tipografia:** Playfair Display para teses; Montserrat para leitura; Poppins para controles; mono para níveis e indicadores.
- **Fotografia:** retratos oficiais do Dr. Luciano com luz controlada, usados como prova de autoridade e não como decoração.
- **Assinatura visual:** o “mapa de maturidade” — uma régua editorial que transforma os cinco pilares em uma sequência de decisão visível.

## Nova arquitetura

1. **Hero / pergunta de controle** — “Se você saísse 30 dias, sua clínica continuaria crescendo?” com retrato oficial, CTA e resumo do diagnóstico.
2. **Cena real / custo oculto** — contraste entre clínica que fatura e empresa que funciona sem centralização.
3. **Filtro de perfil** — para quem o diagnóstico é e quando ainda não é o momento, com menos caixas e mais leitura comparativa.
4. **Entrega concreta** — mapa atual, gargalo prioritário e três próximos passos organizados como uma sequência.
5. **Mapa de maturidade** — cinco pilares em progressão visual, sem uma grade de cards iguais.
6. **Autoridade contextual** — Dr. Luciano como operador real; prova por experiência e método, sem números não validados.
7. **Fechamento de decisão** — repetição da pergunta-âncora e CTA único para iniciar as 20 perguntas.

## Sistema de componentes

- Tokens `--medceo-*` como fonte única de cor, tipo, espaço, raio, sombra e movimento.
- Botão primário retangular com cantos discretos, ação explícita e estado pressionado.
- Eyebrows curtas, em caixa alta, sempre ligadas a uma função de leitura.
- Frames editoriais finos no lugar de sombras e cards arredondados em excesso.
- Interações de 150–400 ms, apenas em `transform` e `opacity`, com `prefers-reduced-motion`.
- Alvos de toque de no mínimo 44 px e foco visível em todos os controles.

## Preservação funcional

- Manter as 20 perguntas, pontuação, cálculo de maturidade e gargalo prioritário.
- Manter abertura por modal para reduzir abandono de contexto.
- Corrigir acessibilidade, scroll lock, fechamento por teclado e responsividade sem mudar a regra de negócio.
- Preservar compatibilidade com TanStack Start, Vite, Nitro/Cloudflare e sincronização do Lovable.

## Quality gate

- A primeira dobra tem uma tese, uma pessoa real e uma ação primária.
- Nenhuma seção depende de placeholder, stock ou SVG abstrato.
- Existe alternância intencional entre night, navy e paper.
- O dourado ocupa menos de 5% da composição e comunica critério.
- A página funciona em 375 px, 768 px e 1440 px sem overflow.
- O diagnóstico avança do início ao resultado com teclado e toque.
- Console limpo, build de produção aprovado, metadados sem resíduos do Lovable.
- Crítica anti-IA final: se um bloco puder pertencer a qualquer mentoria, ele deve ser refeito.
