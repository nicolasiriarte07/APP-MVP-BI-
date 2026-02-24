'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Users, TrendingUp, DollarSign, Target, AlertCircle } from 'lucide-react'

export default function AdminDocumentationPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-500" />
            <h1 className="text-4xl font-bold text-foreground">📚 Documentación Técnica MVP</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Guía completa: cómo se calcula cada métrica, cómo se segmentan los clientes, y cómo funcionan todos los gráficos
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="segmentacion" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card border border-border-border/50 overflow-x-auto">
            <TabsTrigger value="segmentacion" className="text-xs md:text-sm">
              <Users className="w-4 h-4 mr-1 md:mr-2" />
              Segmentación
            </TabsTrigger>
            <TabsTrigger value="centro" className="text-xs md:text-sm">
              <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
              Centro
            </TabsTrigger>
            <TabsTrigger value="crecimiento" className="text-xs md:text-sm">
              <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
              Crecimiento
            </TabsTrigger>
            <TabsTrigger value="ingresos" className="text-xs md:text-sm">
              <DollarSign className="w-4 h-4 mr-1 md:mr-2" />
              Ingresos
            </TabsTrigger>
            <TabsTrigger value="oportunidades" className="text-xs md:text-sm">
              <Target className="w-4 h-4 mr-1 md:mr-2" />
              Oportunidades
            </TabsTrigger>
          </TabsList>

          {/* ==================== SEGMENTACIÓN ==================== */}
          <TabsContent value="segmentacion" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">🎯 Sistema de Segmentación de Clientes</h2>
              <p className="text-muted-foreground">En qué te basas para decir que alguien está en X segmento</p>
            </div>

            {/* Health Segmentation */}
            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">1️⃣ Segmentación de Salud (Health)</CardTitle>
                <CardDescription>Clasifica clientes en 2 estados principales y 5 subsegmentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-lg">📊 Paso 1: Calcular Ciclo de Compra Mediano</h4>
                  <div className="bg-background/50 border border-border-border/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Se toman TODOS los clientes con 2+ compras y se calcula la <strong>mediana</strong> de días entre compras consecutivas.
                    </p>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                      <code className="text-xs text-cyan-300 block whitespace-pre-wrap">
{`Ejemplo:
- Cliente A: Compra día 1, 45, 90 → ciclos [45, 45]
- Cliente B: Compra día 1, 30, 90 → ciclos [30, 60]
- Cliente C: Compra día 1, 60 → ciclos [60]

Todos ciclos: [45, 45, 30, 60, 60]
Mediana = 45 días ← Este es tu CICLO BASE`}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-lg">📊 Paso 2: Calcular LTV Percentiles</h4>
                  <div className="bg-background/50 border border-border-border/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Se suman todos los montos por cliente (Lifetime Value) y se calculan percentiles 40% y 50%.
                    </p>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                      <code className="text-xs text-purple-300 block whitespace-pre-wrap">
{`LTV por cliente = SUM(monto de todas sus compras)

Clientes LTV: [$100, $200, $300, $400, $500]
P40 = $260 (40% de clientes tienen LTV ≤ este valor)
P50 = $300 (mediana, 50% por debajo, 50% por encima)`}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-lg">📊 Paso 3: Clasificación PRIMARIA (Activo vs Dormido)</h4>
                  <div className="bg-background/50 border border-border-border/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Se calcula "días desde última compra" y se compara contra umbrales del ciclo.
                    </p>
                    <div className="space-y-2">
                      <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-3 rounded">
                        <p className="font-mono text-sm text-emerald-300">
                          ✓ ACTIVO: días_desde_última_compra {'<'} (2 × ciclo_mediano)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Ejemplo: Si ciclo = 45, ACTIVO si compró hace {'<'} 90 días</p>
                      </div>
                      <div className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded">
                        <p className="font-mono text-sm text-red-300">
                          ✗ DORMIDO: días_desde_última_compra {'≥'} (2 × ciclo_mediano)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Ejemplo: Si ciclo = 45, DORMIDO si hace {'≥'} 90 días no compra</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-lg">📊 Paso 4: Subsegmentación (5 Segmentos Finales)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-emerald-400">🏆 CHAMPIONS</p>
                      <code className="text-xs text-cyan-300 block bg-background p-2 rounded">
                        Si ACTIVO AND<br/>
                        (días {'<'} 0.8×ciclo) AND<br/>
                        (compras {'≥'} 3 OR LTV {'>'} P40)
                      </code>
                      <p className="text-xs text-muted-foreground">Tus mejores clientes: compran frecuente, reciente y gastón bien.</p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-yellow-400">⚡ REGULARES</p>
                      <code className="text-xs text-cyan-300 block bg-background p-2 rounded">
                        Si ACTIVO AND<br/>
                        NO Champions AND<br/>
                        (días {'<'} 1×ciclo)
                      </code>
                      <p className="text-xs text-muted-foreground">Activos pero no de elite. Tienen potencial de crecimiento.</p>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-orange-400">🚨 EN RIESGO</p>
                      <code className="text-xs text-cyan-300 block bg-background p-2 rounded">
                        Si ACTIVO AND<br/>
                        (1×ciclo ≤ días {'<'} 2×ciclo)
                      </code>
                      <p className="text-xs text-muted-foreground">Compras espaziándose. Alerta de churn próximo.</p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-blue-400">🔄 RECUPERABLES</p>
                      <code className="text-xs text-cyan-300 block bg-background p-2 rounded">
                        Si DORMIDO AND<br/>
                        (2×ciclo ≤ días {'<'} 3.5×ciclo)
                      </code>
                      <p className="text-xs text-muted-foreground">Win-back posible. Aún no están muy perdidos.</p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-red-400">❌ INACTIVO</p>
                      <code className="text-xs text-cyan-300 block bg-background p-2 rounded">
                        Si DORMIDO AND<br/>
                        (días {'≥'} 3.5×ciclo)
                      </code>
                      <p className="text-xs text-muted-foreground">Probablemente churn. Win-back difícil.</p>
                    </div>

                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 space-y-2">
                      <p className="font-bold text-gray-400">📋 INFORMACIÓN</p>
                      <p className="text-xs text-muted-foreground">5 segmentos permiten acciones específicas por grupo</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-200">
                    <strong>💡 Ejemplo real:</strong> Si ciclo = 45 días, P40 LTV = $300:
                    <br/>• Cliente con última compra hace 20 días, 5 compras, LTV $600 → 🏆 CHAMPION
                    <br/>• Cliente con última compra hace 70 días, 2 compras, LTV $150 → 🚨 EN RIESGO
                    <br/>• Cliente con última compra hace 150 días, 3 compras, LTV $200 → 🔄 RECUPERABLE
                    <br/>• Cliente con última compra hace 200 días, 1 compra, LTV $50 → ❌ INACTIVO
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* RFM Segmentation */}
            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">2️⃣ Segmentación RFM (Método Alternativo)</CardTitle>
                <CardDescription>Clasificación tradicional: Loyal, Potential, At Risk, Lost</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-center space-y-1">
                    <p className="font-bold text-emerald-400">💎 LOYAL</p>
                    <code className="text-xs text-cyan-300">Activo + Freq≥2</code>
                    <p className="text-xs text-muted-foreground">Compra repetida y reciente</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-center space-y-1">
                    <p className="font-bold text-yellow-400">🌱 POTENTIAL</p>
                    <code className="text-xs text-cyan-300">Activo + Freq=1</code>
                    <p className="text-xs text-muted-foreground">1ª compra hace poco</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg text-center space-y-1">
                    <p className="font-bold text-orange-400">⚠️ AT RISK</p>
                    <code className="text-xs text-cyan-300">En Riesgo + Any Freq</code>
                    <p className="text-xs text-muted-foreground">Compras espaciadas</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center space-y-1">
                    <p className="font-bold text-red-400">❌ LOST</p>
                    <code className="text-xs text-cyan-300">Dormido</code>
                    <p className="text-xs text-muted-foreground">Hace mucho no compra</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== CENTRO ==================== */}
          <TabsContent value="centro" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">⭐ Centro de Decisiones</h2>
              <p className="text-muted-foreground">Las 4 métricas globales del MVP</p>
            </div>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  1. Ingresos Totales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-background/50 p-3 rounded">
                  <p className="text-sm font-semibold text-foreground">Fórmula:</p>
                  <code className="text-xs text-cyan-300">Σ(monto_compra) donde fecha ∈ [inicio, fin]</code>
                </div>
                <p className="text-sm text-muted-foreground">Suma de todos los montos de compra en el rango de fechas seleccionado.</p>
                <p className="text-sm text-muted-foreground"><strong>Insight:</strong> Es tu métrica #1. Objetivo: maximizar ingresos mientras mantienes rentabilidad.</p>
              </CardContent>
            </Card>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  2. Tasa de Recurrencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-background/50 p-3 rounded">
                  <p className="text-sm font-semibold text-foreground">Fórmula:</p>
                  <code className="text-xs text-cyan-300">(Clientes con 2+ compras) / (Total clientes) × 100%</code>
                </div>
                <p className="text-sm text-muted-foreground">% de clientes que ha comprado en el rango Y antes.</p>
                <p className="text-sm text-muted-foreground"><strong>Insight:</strong> Mide lealtad. Típico: 25-40%. Mayor = mejor retención = menos CAC.</p>
              </CardContent>
            </Card>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  3. Tasa de Recompra Global
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-background/50 p-3 rounded">
                  <p className="text-sm font-semibold text-foreground">Fórmula:</p>
                  <code className="text-xs text-cyan-300">(Compras de clientes repeat) / (Total compras) × 100%</code>
                </div>
                <p className="text-sm text-muted-foreground">% de volumen de ingresos que viene de clientes que compraron 2+ veces.</p>
                <p className="text-sm text-muted-foreground"><strong>Insight:</strong> Mayor = negocio más estable. Menos dependencia de nuevos clientes.</p>
              </CardContent>
            </Card>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  4. Base de Clientes / Órdenes Totales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-background/50 p-3 rounded">
                  <p className="text-sm font-semibold text-foreground">Fórmula:</p>
                  <code className="text-xs text-cyan-300">COUNT(cliente_id DISTINCT) / COUNT(orden_id)</code>
                </div>
                <p className="text-sm text-muted-foreground">Cantidad de clientes únicos y órdenes en el período. El ratio muestra compras/cliente.</p>
                <p className="text-sm text-muted-foreground"><strong>Insight:</strong> Ratio 1.3x = cliente promedio compra 1.3 veces en el período.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== CRECIMIENTO ==================== */}
          <TabsContent value="crecimiento" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">📈 Módulo Crecimiento</h2>
              <p className="text-muted-foreground">Dinámicas de compra, cohortes, retención por #compra</p>
            </div>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle>📊 Heatmap de Cohortes (Cohort Analysis)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Tabla mostrando retención y LTV de clientes agrupados por mes de 1ª compra.
                </p>
                <div className="bg-background/50 border border-border-border/30 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-foreground">Cálculo:</p>
                  <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Agrupar clientes por mes de PRIMERA compra (ej: Ene 2024, Feb 2024, Mar 2024...)</li>
                    <li>Para cada cohorte, contar cuántos recompran en M+1, M+2, M+3... meses después</li>
                    <li>Calcular retención %: (clientes que recompran después N meses) / (total cohorte)</li>
                    <li>Calcular LTV acumulado para cada período</li>
                    <li>Mostrar matriz: filas=cohortes, columnas=meses post-1ª compra, celdas=retention% o LTV</li>
                  </ol>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded text-xs">
                  <p className="text-amber-200">
                    <strong>Ejemplo:</strong> Cohorte Enero 2024: 100 clientes nuevos. En Febrero (M1): 45 compran (45% retention). En Marzo (M2): 30 de esos 45 compran de nuevo (67% M2 retention dentro de M1)...
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle>📊 Dinámicas por # de Compra (Order Metrics)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  % de clientes que avanzan de compra N a compra N+1.
                </p>
                <div className="bg-background/50 border border-border-border/30 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-foreground">Cálculo:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Retención 1→2: (Clientes con 2+ compras) / (Total clientes) × 100%</p>
                    <p>Retención 2→3: (Clientes con 3+ compras) / (Clientes con 2+ compras) × 100%</p>
                    <p>Retención N→N+1: (Clientes con N+1 compras) / (Clientes con N compras) × 100%</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2"><strong>Insight:</strong> Si 1→2 es baja (15%), tu problema es convertir clientes nuevos. Si 5→6 es baja, clientes están saciados.</p>
              </CardContent>
            </Card>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle>🏆 Top Productos Adquiriendo Clientes Nuevos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Productos que aparecen en la PRIMERA compra de clientes (ordenados por frecuencia).
                </p>
                <div className="bg-background/50 border border-border-border/30 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-foreground">Cálculo:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>1. Para cada cliente: tomar su 1ª compra</p>
                    <p>2. Extraer productos (separados por " / ")</p>
                    <p>3. Contar ocurrencias de cada producto</p>
                    <p>4. Rankear descendente por frecuencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== INGRESOS ==================== */}
          <TabsContent value="ingresos" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">💰 Módulo Ingresos</h2>
              <p className="text-muted-foreground">LTV, AOV, ticket drivers, bundles, lift score</p>
            </div>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle>📊 LTV y AOV por # de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="bg-background/50 p-3 rounded">
                    <p className="text-sm font-semibold text-foreground">LTV por # Compra:</p>
                    <code className="text-xs text-cyan-300">SUM(monto) / COUNT(clientes_con_N_compras)</code>
                  </div>
                  <div className="bg-background/50 p-3 rounded">
                    <p className="text-sm font-semibold text-foreground">AOV por # Compra:</p>
                    <code className="text-xs text-cyan-300">SUM(monto) / COUNT(compras_N)</code>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground"><strong>Insight:</strong> Si LTV2 {'>'} LTV1×1.5, los repeat customers gastan mucho más. Oportunidad: retenerlos con incentivos.</p>
              </CardContent>
            </Card>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle>🎯 Top Productos Impulsando Carritos de Alto Valor (Ticket Drivers)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Productos que aparecen en carritos del 80º percentil (los más caros).
                </p>
                <div className="bg-background/50 border border-border-border/30 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-foreground">Cálculo (paso a paso):</p>
                  <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Calcular percentil 80 del monto de compra (ej: P80 = $500)</li>
                    <li>Filtrar SOLO compras con monto {'≥'} P80</li>
                    <li>Extraer productos de esas compras altas</li>
                    <li>Contar frecuencia de cada producto EN carritos altos</li>
                    <li>Calcular Lift Score: (freq_en_alto / freq_total) / (carritos_alto / carritos_total)</li>
                    <li>Calcular % Alto Valor: (apariciones_en_carrito_alto / total_apariciones_alto) × 100%</li>
                  </ol>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded text-xs">
                  <p className="text-amber-200">
                    <strong>Ejemplo:</strong> Producto X aparece en 15/20 compras {'>'} $500, pero solo en 40/200 compras totales.
                    <br/>Lift = (15÷20) ÷ (40÷200) = 0.75 ÷ 0.20 = <strong>3.75x</strong>
                    <br/>Este producto MULTIPLICA el valor del carrito 3.75 veces.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle>📦 Top Duos y Tríos de Productos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Pares y tríos de productos comprados juntos frecuentemente.
                </p>
                <div className="bg-background/50 border border-border-border/30 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-foreground">Cálculo:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Duos:</strong></p>
                    <p className="ml-4">1. Para cada compra con 2+ productos</p>
                    <p className="ml-4">2. Generar todas las combinaciones de 2 productos</p>
                    <p className="ml-4">3. Contar ocurrencias de cada dupla</p>
                    <p><strong>Tríos:</strong> Mismo proceso pero con 3 productos</p>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded text-xs">
                  <p className="text-blue-200">
                    <strong>Ejemplo:</strong> Si compra = [ProductoA, ProductoB, ProductoC]
                    <br/>Duos generados = [(A,B), (A,C), (B,C)]
                    <br/>Tríos generados = [(A,B,C)]
                    <br/>Si este duo/trío aparece {'≥'}1 vez, se cuenta.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== OPORTUNIDADES ==================== */}
          <TabsContent value="oportunidades" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">🎯 Módulo Oportunidades</h2>
              <p className="text-muted-foreground">Recomendaciones estratégicas automáticas</p>
            </div>

            <Card className="border border-border-border/50">
              <CardHeader>
                <CardTitle>🤖 Cómo se generan las Oportunidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  El sistema analiza automáticamente tus datos y genera recomendaciones basadas en estos patrones:
                </p>
                
                <div className="space-y-3">
                  <div className="border-l-4 border-emerald-500 bg-emerald-500/10 p-3 rounded">
                    <p className="text-sm font-semibold text-emerald-400">📊 Oportunidad 1: Mejorar Tasa de 2ª Compra</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Si Retención 1→2 {'<'} 35%, recomienda: "Implementa programa de incentivos post-compra en primeros 30 días"
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 bg-blue-500/10 p-3 rounded">
                    <p className="text-sm font-semibold text-blue-400">💰 Oportunidad 2: Maximizar AOV de 1ª Compra</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Si AOV_1 {'<'} AOV_3, recomienda: "Ticket promedio 1ª compra es bajo. Prueba bundles o upsells en checkout"
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 bg-purple-500/10 p-3 rounded">
                    <p className="text-sm font-semibold text-purple-400">🔄 Oportunidad 3: Retención a Largo Plazo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Si Tasa Recompra Global {'<'} 50%, recomienda: "Existe espacio para crecer. Enfócate en retención después de mes 3"
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 bg-orange-500/10 p-3 rounded">
                    <p className="text-sm font-semibold text-orange-400">🏆 Oportunidad 4: Replicar Cohorte de Alto Valor</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Identifica el cohorte con LTV 6M más alto: "Investi y replica los canales/campañas de ese período"
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 bg-red-500/10 p-3 rounded">
                    <p className="text-sm font-semibold text-red-400">🔄 Oportunidad 5: Win-Back de Recuperables</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Si hay muchos clientes en segmento RECUPERABLES: "Lanza campaña de win-back. Potencial alto de conversión"
                    </p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded mt-4">
                  <p className="text-sm text-blue-200">
                    <strong>💡 Las oportunidades se regeneran cada vez que subes datos nuevos.</strong> El sistema automáticamente re-analiza y prioriza por impacto potencial.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="bg-background/50 border border-border-border/30 rounded-lg p-6 mt-12 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            🔒 Página Protegida
          </h3>
          <p className="text-sm text-muted-foreground">
            Esta documentación está disponible SOLO en /admin. NO aparece en búsquedas. Úsala para:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Capacitar a tu equipo sobre cómo funciona el MVP</li>
            <li>Demostrar el valor del producto a clientes potenciales</li>
            <li>Entender la lógica detrás de cada métrica y segmento</li>
            <li>Hacer pitch con confianza sobre tu análisis de datos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

import { BarChart3 } from 'lucide-react'
