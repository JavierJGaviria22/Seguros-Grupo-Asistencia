
$(document).ready(function () {
    $('#abrir-form').on('click', function (e) {
        e.preventDefault();

        $('#header').addClass('d-none');
        $('#leer-mas').addClass('d-none');

        // Mostrar formulario
        $('#formulario').removeClass('d-none').fadeIn();;
    });

    $('#contactForm').on('submit', function (e) {
        e.preventDefault();

        $('#ofertasSection').addClass('d-none');
        $('#submitErrorMessage').addClass('d-none').text('');
        $('#submitSuccessMessage').addClass('d-none');

        let nombre = $('#nombre').val().trim();
        let apellido = $('#apellido').val().trim();
        let fecha = $('#fecha').val();
        let placa = $('#placa').val().trim();

        let errores = [];

        // Validacion inputs
        if (!nombre) errores.push('El nombre es obligatorio.');
        if (!apellido) errores.push('El apellido es obligatorio.');
        if (!fecha) errores.push('La fecha de nacimiento es obligatoria.');
        const placaRegex = /^[A-Z]{3}\d{3}$/;
        if (!placa) {
            errores.push('La placa es obligatoria.');
        } else {
            if (placa.length > 6) {
                errores.push('La placa no puede tener más de 6 caracteres.');
            }
            if (!placaRegex.test(placa)) {
                errores.push('La placa debe tener el formato ABC123 (3 letras mayúsculas y 3 números).');
            }
        }

        // en caso de que haya errores se detiene la peticion y se muestran
        if (errores.length > 0) {
            $('#submitErrorMessage')
                .removeClass('d-none')
                .html(errores.join('<br>'));
            return;
        }

        $.ajax({
            url: '/SGA/cotizar',
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ nombre, apellido, fecha, placa }),
            success: function (response) {
                // validar si la respuesta si tiene planes
                if (response && Array.isArray(response) && response.length > 0) {
                    generarTabla(response, nombre, apellido);
                } else {
                    // error por no recibir ofertas
                    $('#submitErrorMessage')
                        .removeClass('d-none')
                        .text(response.message || 'No se encontraron planes para esta placa.')
                        .fadeIn();
                    $('#tablaOfertas tbody').empty();
                }
            },
            error: function () {
                $('#submitErrorMessage')
                    .removeClass('d-none')
                    .text('Error al enviar el formulario. Intenta de nuevo.')
                    .fadeIn();
                $('#tablaOfertas tbody').empty();

            }
        });

        function generarTabla(ofertas, nombre, apellido) {
            // siempre al llamar la funcion limpiar la tabla
            const tabla = $('#tablaOfertas tbody');
            const nombreCliente = nombre + ' ' + apellido;
            $('#cliente').text('Cliente: ' + nombreCliente);
            const fecha_actual = new Date(new Date().setHours(new Date().getHours() - 5)).toISOString().split('T')[0];
            $('#fecha_hoy').text('Fecha: ' + fecha_actual);;
            tabla.empty();

            // recorrer los planes y ofertas
            ofertas.forEach(oferta => {
                const fila = `
            <tr>
                <td>${oferta.noCotizacion}</td>
                <td>${oferta.nombreProducto}</td>
                <td>$${parseFloat(oferta.valor).toLocaleString()}</td>
            </tr>
        `;
                tabla.append(fila);
            });
            $('#ofertasSection').removeClass('d-none').fadeIn();
            $('#submitErrorMessage').addClass('d-none').fadeOut();
        }
    });
});