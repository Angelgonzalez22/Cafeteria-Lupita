## Cómo entendiste el problema, en tus palabras.
Pude entender la necesidad de un sistema practico para registrar sus ventas y adminsitracion para la cafeteria, donde no solo buscan pues registrar sus ventas sino tener un control completo y conocer bien lo que es su manejo y como van las cosas, identificando que tanto el que atiende como los cocineros deben tener una informacion centralizada para un mejor manejo del local.

## Qué decidiste hacer y qué decidiste no hacer, y por qué.
Que decide hacer:
    Primero que nada organizar las reponsabilidades teniendo cada rol importante dentro del entorno del sistema saber que el administrador esta ahi para algo al igual del cajero incluso el cocinero para conocer bien el estado de cada pedido.

    Decidi tambien realizar el proceso Offline ya que si lo veo necesario conociendo su necesidad y problematica de que a cada cierto tiempo se le va el internet no contar con esto primero hace que el sistema por bien que se realice en un momento critico no seria de mucho ayuda y podria detener la productividad.

    Mantener una auditoria en base a los movimientos de precio y control de los pedidos que se realizan en el sistema.
    
    Hacer que cada rol importante sea requerido un login, asi no puede haber supuestos casos como que se pierda un mobil y registre ventas fantasmas o que haya registro no acorde a la venta real.

Que decidi no hacer:
    El tema de descuento y promociones sobre todo ya que buscan que sea algo rapido no quise meterme en el enrollo de hacer clientes que se registren , con eso podia hacer los puntos de descuentos en los cumpleaños o incluso lo de fiar hasta el viernes.
    
    No genero una facturacion fiscal ya que requiere cosas que en el MVP principal no vi necesario

    Un sistema de contabilidad completa lo reduci a lo que necesitaban controlar sus ventas y costos.  
    
    Una creacion de productos con sus imagenes, para esto se necesita levantar un servidor de imagenes y aunque a nivel de usuario es mejor subir sus propias imagenes preferi hacerlo a nivel de ruta url.  

## Qué supuestos tomaste donde el mensaje no era claro.
Primero decidi que cada empleado asumia que rol debe cumplir de manera individual y que esos procesos sobre todo a nivel de cajera se maneje asi no tengan una globalizacion de responsabilidades

A nivel de metodo de pago decidi que todo va ser a nivel de efectivo sobre todo por la necesidad que no sea tan costoso hacer una aplicacion que implemente estas tecnologias o Yappy suelen tener un presupuesto elevado

Asumi tambien que ademas de manejar en cuanto venden sus producto tambien tenga el registro de su costo para que asi se vea en el reporte su total cobrado en base a la fecha que pongan y una utilidad bruta para que a nivel estadistico vean su ganancias adicional de que producto es el que mas se vende y conocer su media de productos.

## Qué le preguntarías a Doña Lupita si pudieras.
Como manejaria su nivel administrativo, sinceramente estos sitios siempre me parece que necesitan un control o manejo web para estas cosas el crear un cliente, un producto todos estos temas de creacion sea a ese nivel sobre todo explicando el porque deberia ser mejor en un sistema asi que en movil.

A la hija le preguntaria que otro tipo de reportes le gustaria ver ya que si muestro las gananacias al final del dia y un top de productos vendidos pero podrian haber reportes como que se vea mensual mente la media de un en especifico y otros reportes que podrian agregarse.

## Qué mejorarías con una semana más
Bueno dependiendo de la repuesta de la Doña Lupita seria el CRUD tanto de los productos como los usuarios saber si se haria a nivel de una plataforma web o si de ser necesario realizarlo completo a nivel de app.

Implementar el sistema de cliente la estructura actual deja el campo de la persona abierto pero se podria implementar un id para si es una persona que es frecuente guardar sus datos y poder sobre todo ver lo del descuento de jubilado en base a su fecha de nacimiento y tambien si esta de cumpleaños seria efectivo.

Estudiar mejores escenarios con el tema de Offline fue mi primera vez trabajando un entorno asi y validaria escenario como multiples cajeras subiendo sus pedidos entre otros.
