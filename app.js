document.addEventListener("DOMContentLoaded", () => {
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
});
