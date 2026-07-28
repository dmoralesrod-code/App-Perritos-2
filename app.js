document.addEventListener("DOMContentLoaded", () => {

    // Función para renderizar reportes en el contenedor inferior
    function mostrarReportes() {
        const contenedor = document.getElementById("lista-reportes");
        if (!contenedor) return;

        const denuncias = JSON.parse(localStorage.getItem("denuncias_perritos") || "[]");

        if (denuncias.length === 0) {
            contenedor.innerHTML = '<p style="font-size: 0.85rem; color: #777;">No hay reportes registrados aún.</p>';
            return;
        }

        contenedor.innerHTML = denuncias.map(d => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0; font-size: 0.88rem;">
                <p style="color: #d9534f; font-weight: bold; margin-bottom: 4px;">🚨 ${d.tipo || 'Maltrato'}</p>
                <p><strong>Ubicación:</strong> ${d.ubicacion}</p>
                <p><strong>Detalles:</strong> ${d.descripcion}</p>
                <div style="background-color: #f8f9fa; padding: 8px; border-radius: 6px; margin-top: 6px; border: 1px solid #e9ecef;">
                    <p style="font-weight: bold; color: #333; margin-bottom: 2px;">👤 Presunto Responsable:</p>
                    <p>• <strong>Nombre/Apodo:</strong> ${d.responsable?.nombre || 'No especificado'}</p>
                    <p>• <strong>Relación:</strong> ${d.responsable?.relacion || 'No especificada'}</p>
                    <p>• <strong>Descripción:</strong> ${d.responsable?.descripcion || 'Sin descripción'}</p>
                </div>
                <small style="color: #888; display: block; margin-top: 4px;">📅 ${d.fecha}</small>
            </div>
        `).join("");
    }

    // Cargar reportes iniciales
    mostrarReportes();

    // 1. CARGAR DATOS DESDE EL JSON (Canales y Categorías)
    fetch("data.json")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar JSON");
            return response.json();
        })
        .then(data => {
            // Renderizar Canales de atención
            const contenedorCanales = document.getElementById("lista-canales");
            if (contenedorCanales && data.lineasAtencion) {
                const nombresPorDefecto = ["Emergencias", "Protección Animal"];
                contenedorCanales.innerHTML = data.lineasAtencion.map((l, index) => {
                    let titulo = nombresPorDefecto[index] || `Línea ${index + 1}`;
                    let numero = "";

                    if (typeof l === "object" && l !== null) {
                        titulo = l.nombre || l.titulo || l.tipo || nombresPorDefecto[index] || "Línea";
                        numero = l.numero || l.telefono || Object.values(l)[1] || Object.values(l)[0];
                    } else {
                        numero = l;
                    }

                    return `<p style="margin: 4px 0;"><strong>${titulo}:</strong> ${numero}</p>`;
                }).join("");
            }

            // Renderizar Categorías en el Select
            const selectCategoria = document.getElementById("select-tipo");
            if (selectCategoria && data.categorias) {
                selectCategoria.innerHTML = '<option value="">Selecciona una categoría...</option>';
                data.categorias.forEach(cat => {
                    const option = document.createElement("option");
                    const valor = typeof cat === "object" ? (cat.nombre || cat.titulo || Object.values(cat)[0]) : cat;
                    option.value = valor;
                    option.textContent = valor;
                    selectCategoria.appendChild(option);
                });
            }
        })
        .catch(error => console.error("Error en fetch:", error));


    // 2. CAPTURAR UBICACIÓN GPS
    const btnGeo = document.getElementById("btn-geolocalizar");
    const inputUbicacion = document.getElementById("ubicacion");

    if (btnGeo && inputUbicacion) {
        btnGeo.addEventListener("click", (e) => {
            e.preventDefault();
            if (navigator.geolocation) {
                inputUbicacion.value = "Obteniendo ubicación...";
                navigator.geolocation.getCurrentPosition(
                    (posicion) => {
                        const lat = posicion.coords.latitude;
                        const lon = posicion.coords.longitude;
                        inputUbicacion.value = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                    },
                    (error) => {
                        alert("No se pudo obtener la ubicación automáticamente.");
                        inputUbicacion.value = "";
                    }
                );
            } else {
                alert("Tu navegador no soporta geolocalización.");
            }
        });
    }


    // 3. CAPTURAR Y GUARDAR EL FORMULARIO
    const formulario = document.getElementById("form-maltrato");
    if (formulario) {
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();

            const nuevaDenuncia = {
                id: Date.now(),
                tipo: document.getElementById('select-tipo').value,
                ubicacion: document.getElementById('ubicacion').value,
                descripcion: document.getElementById('descripcion').value,
                responsable: {
                    nombre: document.getElementById('nombreResponsable').value || 'No especificado',
                    descripcion: document.getElementById('descripcionResponsable').value || 'Sin descripción',
                    relacion: document.getElementById('relacionPerrito').value
                },
                fecha: new Date().toLocaleString()
            };

            // Guardar en LocalStorage
            const denunciasGuardadas = JSON.parse(localStorage.getItem('denuncias_perritos') || '[]');
            denunciasGuardadas.push(nuevaDenuncia);
            localStorage.setItem('denuncias_perritos', JSON.stringify(denunciasGuardadas));

            alert("¡Reporte guardado exitosamente!");
            formulario.reset();
            
            // Actualizar vista inmediatamente
            mostrarReportes();
        });
    }

});
