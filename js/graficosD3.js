// I. Configuración
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

margins = { top: 30, left: 110, right: 15, bottom: 180 }

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// II. Variables globales
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

y = d3.scaleLinear()
          .range([alto, 0])

// a. Para poner las barras vamos a utilizar un scaleBand()
x = d3.scaleBand()
      .range([0, ancho])
      // d. Parámetros extras del escalador
      .paddingInner(0.1)
      .paddingOuter(0.3)

// f. Para convertir datos ordinales usamos scaleOrdinal
color = d3.scaleOrdinal()
          // .range(['red', 'green', 'blue', 'yellow'])
          // https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
          .range(d3.schemeDark2)

// i. Ejes lo primero es crear un "grupo"
xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')

// j. Título superior de la gráfica
titulo = g.append('text')
          .attr('x', `${ancho / 2}px`)
          .attr('y', '-10px')
          .attr('text-anchor', 'middle')
          .text('TOTAL DE RECAUDACION DE IMPUESTOS POR ESTADO EN 2019')
          .attr('class', 'titulo-grafica')

dataArray = []

//Métodos privados
region = 'todas'
regionselect = d3.select('#region')

// III. render (update o dibujo)
function render(data) {
  // function(d, i) { return d }
  // (d, i) => d
  bars = g.selectAll('rect')
            .data(data)

  bars.enter()
      .append('rect')
        .style('width', d => `${x.bandwidth()}px`)
        .style('height', d => (alto - y(d.MONTO_IMPUESTOS)) + 'px')
        .style('x', d => x(d.ENTIDAD_FEDERATIVA) + 'px')
        .style('y', d => (y(d.MONTO_IMPUESTOS)) + 'px')
        .style('fill', d => color(d.ENTIDAD_FEDERATIVA))

      // j. call que sirve para crear los ejes
      yAxisCall = d3.axisLeft(y)
                    .ticks(5)
                    .tickFormat(d3.format(',.0d'))
      yAxisGroup.call(yAxisCall)

      xAxisCall = d3.axisBottom(x)
      xAxisGroup.call(xAxisCall)
                .selectAll('text')
                .attr('x', '-8px')
                .attr('y', '-5px')
                .attr('text-anchor', 'end')
                .attr('transform', 'rotate(-70)')
}

// IV. Carga de datos
d3.csv('/data/totalRecaudacion.csv')
.then(function(data) {
  data.forEach(d => {
    d.CICLO = +d.CICLO
    d.MONTO_IMPUESTOS = +d.MONTO_IMPUESTOS
  })

  //Filtramos solo el año 2019
  data = data.filter((d) => {
    return (d.CICLO == '2019')
  })

  this.dataArray = data

  // Calcular la altura más alta dentro de
  // los datos (columna "oficial")
  maxy = d3.max(data, d => d.MONTO_IMPUESTOS)

  // Creamos una función para calcular la altura
  // de las barras y que quepan en nuestro canvas
  y.domain([0, maxy])

  // b. Poner el dominio del escalador x, convertir los nombres de los
  //    edificios en valores de X para ubicar las barras
  x.domain(data.map(d => d.ENTIDAD_FEDERATIVA))
  // console.log('Edificios')
  // console.log(data.map(d => d.edificio))

  // g. Al igual que con los edificios, voy a poner las regiones
  //    como dominio del escalador 'color'
  color.domain(data.map(d => d.ENTIDAD_FEDERATIVA))

  // V. Despliegue
  render(dataArray)
})
.catch(e => {
  console.log('No se tuvo acceso al archivo ' + e.message)
})

