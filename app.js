document.addEventListener("DOMContentLoaded", () => {

    // Función para renderizar los reportes guardados en pantalla
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
                <div style="background-color: #f1f1f1; padding: 8px; border-radius: 6px; margin-top: 6px;">
                    <p style="font-weight: bold; margin-bottom: 2px;">👤 Presunto Responsable:</p>
                    <p>• Nombre/Apodo: ${d.responsable?.nombre || 'No especificado'}</p>
                    <p>• Relación: ${d.responsable?.relacion || 'No especificada'}</p>
                    <p>• Descripción: ${d.responsable?.descripcion || 'Sin descripción'}</p>
                </div>
                <small style="color: #888; display: block; margin-top: 4px;">Fecha: ${d.fecha}</small>
            </div>
        `).join("");
    }

    // Cargar reportes guardados al iniciar
    mostrarReportes();

    // 1. CARGAR DATOS DESDE EL JSON (fetch)
    fetch("data.json")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar JSON");
            return response.json();
        })
        .then(data => {
            // Cargar líneas de atención
            if (data.lineasAtencion) {
                const elementos = Array.from(document.querySelectorAll("*"));
                const elementoCargando = elementos.find(el => el.children.length === 0 && el.textContent.includes("Cargando líneas"));
                
                if (elementoCargando) {
                    const nombresPorDefecto = ["Emergencias", "Protección Animal"];
                    const lineasHTML = data.lineasAtencion.map((l, index) => {
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

                    elementoCargando.parentElement.innerHTML = lineasHTML;
                }
            }

            // Cargar categorías en el select
            const selectCategoria = document.querySelector("select");
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
    const botones = Array.from(document.querySelectorAll("button"));
    const btnUbicacion = botones.find(b => b.textContent.includes("GPS")) || botones[0];
    const inputUbicacion = document.querySelector('input[placeholder*="Dirección"]') || document.querySelector("input");

    if (btnUbicacion && inputUbicacion) {
        btnUbicacion.addEventListener("click", (e) => {
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

            const nombreResponsable = document.getElementById('nombreResponsable').value || 'No especificado';
            const descripcionResponsable = document.getElementById('descripcionResponsable').value || 'Sin descripción';
            const relacionPerrito = document.getElementById('relacionPerrito').value;

            const nuevaDenuncia = {
                id: Date.now(),
                tipo: document.getElementById('select-tipo').value,
                ubicacion: document.getElementById('ubicacion').value,
                descripcion: document.getElementById('descripcion').value,
                responsable: {
                    nombre: nombreResponsable,
                    descripcion: descripcionResponsable,
                    relacion: relacionPerrito
                },
                fecha: new Date().toLocaleString()
            };

            // Guardar localmente
            const denunciasGuardadas = JSON.parse(localStorage.getItem('denuncias_perritos') || '[]');
            denunciasGuardadas.push(nuevaDenuncia);
            localStorage.setItem('denuncias_perritos', JSON.stringify(denunciasGuardadas));

            alert("¡Reporte enviado exitosamente!");
            formulario.reset();
            
            // Refrescar la lista en pantalla
            mostrarReportes();
        });
    }

});
