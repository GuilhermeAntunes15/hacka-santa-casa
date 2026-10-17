# Notas do design-agent para o 3D (coder)

Layout novo já em produção (Hero, Simulador, Explorador). Pedidos para `Mattress3D.tsx` / `MattressLayers.tsx`:

1. **Hero — enquadramento**: o palco do hero agora tem 4 callouts HTML fixos nos cantos no desktop (A topo-esq., D topo-dir., C base-esq., B base-dir. a ~64px do fundo). Manter o colchão + controlador dentro dos ~60% centrais do quadro (câmera um pouco mais afastada ou `fov` maior no `hero`) para não ficar sob os rótulos. Controlador externo de preferência à direita-baixo, sem passar sob os botões de zoom (canto inferior direito, 3×40px).
2. **Simulador — câmera**: ângulo de 3/4 vindo dos pés (lateral aberta visível) para que a inclinação lateral leia bem; o palco tem 340–560px de altura no desktop e **encolhe para 240–400px durante falha** (o alerta vira faixa sob o 3D). Ideal: modelo ocupar ~70% da largura do palco.
3. **Fundo**: canvas transparente (o palco já pinta gradiente `#0E2740 → #081627` + grid técnico). Não adicionar cor de fundo no Canvas.
4. **Luz**: chave fria à frente-direita, preenchimento azul fraco, rim discreto por trás para recortar a silhueta contra o fundo escuro. Sem bloom/glow.
5. **Cores**: capa navy (~`#1B2A4F`), câmaras azul translúcido (opacidade fixa), espuma cinza-claro (~`#C9CED6`), controlador branco com tela escura e LED verde (vermelho piscando em falha). Grupo A ciano dessaturado / B azul quando "Mostrar grupos" estiver ativo.
6. **Cargas artificiais** no simulador: mais visíveis (opacidade ~0.4–0.5, aresta clara) — hoje parecem caixas fantasmas.
7. **Explorador no mobile (375px)**: o modelo explodido sai cortado nas laterais; afastar a câmera do `explorer` em aspect < 1 (ex.: `fov` maior ou distância proporcional a `1/aspect`).
8. **Hero 1366x768**: hoje o callout B (base-dir.) cobre a tubulação e o controlador; puxar o controlador para mais perto do colchão ou recentralizar o modelo.
