const dummyDB = require('../../lib/data');
const assert = require('assert');

function crearPoliza(req, res, next) {
  try {
      const codigo = req.body.codigo;
      const contratante = req.body.contratante;
      const entidadAsegurable = req.body.entidadAsegurable;

      //Validaciones.
      assert(codigo, new Error('codigo vacio'));
      assert(contratante, new Error('contratante vacio'));
      assert(entidadAsegurable, new Error('entidadAsegurable vacio'));

      const poliza = {
          id : "P" + dummyDB.polizas.length,
          codigo,
          contratante,
          entidadAsegurable,
          coberturas : dummyDB.coberturas[codigo],
          historialEndosos : []
      };

      //Buscamos una poliza para esta entidad asegurable, con el mismo codigo de poliza.
      const polizaExistente = dummyDB.polizas.find(o => o.entidadAsegurable === poliza.entidadAsegurable && o.codigo === poliza.codigo);

      if (polizaExistente) {
          throw new Error('Poliza existente');
      } 
      
      dummyDB.polizas.push(poliza);
      res.send(poliza);
      

  } catch (err) {
    next(err);
  }
}

function pagoPoliza(req, res, next) {
    try {
        const id = req.body.id;
        const fechaInicio = req.body.fechaInicio;
  
        //Validaciones.
        assert(id, new Error('id vacio'));
  
        //Buscamos la poliza a pagar, creada previamente.
        const poliza = dummyDB.polizas.find(o => o.id === id);
  
        validarPago(poliza);

        //Simulamos el pago de la poliza.
        poliza.pago = pagoSimulado();

        if (!poliza.pago) {
            throw new Error('Error en pago');
        }
        
        //Agregamos las fechas.
        const vigencia = dummyDB.vigencias[poliza.codigo];
        poliza.fechaEmision = new Date();
        poliza.fechaInicio = fechaInicio ? fechaInicio : poliza.fechaEmision;
        poliza.fechaFin = new Date( poliza.fechaInicio.setMonth( poliza.fechaInicio.getMonth() + vigencia ) );
        res.send(poliza);
        
    } catch (err) {
      next(err);
    }
  }

  function endosoPoliza(req, res, next) {
    try {
        const id = req.body.id;
        const tipo = req.body.tipo;
        const modificacion = req.body.modificacion;
  
        //Validaciones.
        assert(id, new Error('id vacio'));
  
        //Buscamos la poliza a endosar, creada y pagada previamente.
        const poliza = dummyDB.polizas.find(o => o.id === id && o.pago);

        validarEndoso(poliza);

        aplicarEndoso(poliza, tipo, modificacion);
        res.send(poliza);
        
    } catch (err) {
      next(err);
    }
  }

  function cancelarPoliza(req, res, next) {
    try {
        const id = req.body.id;
  
        //Validaciones.
        assert(id, new Error('id vacio'));
  
        //Buscamos la poliza a cancelar, creada y pagada previamente.
        const poliza = dummyDB.polizas.find(o => o.id === id && o.pago);

        validarCancelacion(poliza);

        //Actualizamos la fecha de fin.
        poliza.fechaFin = new Date();
        res.send(poliza);
        
    } catch (err) {
      next(err);
    }
  }

function pagoSimulado() {
      return true;
  }

function aplicarEndoso(poliza, tipo, modificacion) {

    switch (tipo) {
        case 'COBERTURAS' : 
            poliza.coberturas = modificacion;
            poliza.historialEndosos.push({
                tipo,
                modificacion
            });
        break;
        case 'CONTRATANTE' : 
            poliza.contratante = modificacion;
            poliza.historialEndosos.push({
                tipo,
                modificacion
            });
        break;
        case 'ENTIDAD_ASEGURABLE' : 
            const polizaVigente = dummyDB.polizas.find(o => o.entidadAsegurable === modificacion && o.codigo === poliza.codigo);
            if (polizaVigente) {
                throw new Error('Ya existe una poliza con el mismo codigo para la entidad asegurable');
            }
            poliza.entidadAsegurable = modificacion;
            poliza.historialEndosos.push({
                tipo,
                modificacion
            });
        break;
        default : 
        throw new Error('Error en el tipo de endoso');
    }

}

function validarPago(poliza) {
    if (!poliza) {
        throw new Error('Poliza inexistente');
    } 

    if (poliza.pago) {
        throw new Error('La poliza ya esta pagada');
    } 
}

function validarEndoso(poliza) {
    if (!poliza) {
        throw new Error('Poliza inexistente o sin pagar');
    } 

    if (poliza.codigo === 'RCO') {
        throw new Error('No se puede endosar poliza con codigo RCO');
    }
}

function validarCancelacion(poliza) {
    if (!poliza) {
        throw new Error('Poliza inexistente o sin pagar');
    } 

    if (poliza.codigo === 'RCO') {
        throw new Error('No se puede cancelar poliza con codigo RCO');
    }
}



module.exports = { crearPoliza, pagoPoliza, endosoPoliza, cancelarPoliza };