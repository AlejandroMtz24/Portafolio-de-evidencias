graph TD
    %% Estilos Personalizados con Colores Tecnológicos
    classDef frontend fill:#2c3e50,stroke:#34495e,stroke-width:2px,color:#fff;
    classDef backend fill:#16a085,stroke:#1abc9c,stroke-width:2px,color:#fff;
    classDef sql fill:#c0392b,stroke:#e74c3c,stroke-width:2px,color:#fff;
    classDef mongo fill:#27ae60,stroke:#2ecc71,stroke-width:2px,color:#fff;

    %% Nodos de la Arquitectura
    UI[1. INTERFAZ WEB - FRONTEND<br>Prototipos de Pantallas<br>Responsable: Dana] :::frontend
    API[2. WEB API - BACKEND CORE<br>Servicios REST en C#<br>Responsable: Jorge] :::backend
    SQL[(3. SQL SERVER<br>Base de Datos Relacional<br>Responsable: Chris)] :::sql
    MONGO[(4. MONGODB<br>Base de Datos Documental<br>Responsable: Chris)] :::mongo

    %% Flujos de Comunicación e Integración (Alejandro)
    UI -->|Peticiones HTTP / Payload JSON| API
    API -->|Persistencia Operación Viva| SQL
    API -->|Historial Inmutable de Tickets| MONGO

    %% Notas de Infraestructura
    subgraph Entorno Contenerizado con Docker Compose - Gestión: Alejandro
        API
        SQL
        MONGO
    end
