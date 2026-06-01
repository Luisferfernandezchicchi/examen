const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); 

// 1. CONEXIÓN A MONGO DB ATLAS
const MONGO_URI = 'mongodb://lfernandezchicchi_db_user:examen@ac-zvc39d7-shard-00-00.0ejpdtp.mongodb.net:27017,ac-zvc39d7-shard-00-01.0ejpdtp.mongodb.net:27017,ac-zvc39d7-shard-00-02.0ejpdtp.mongodb.net:27017/?ssl=true&replicaSet=atlas-2rqylw-shard-0&authSource=admin&appName=seguridad';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Conectado exitosamente a MongoDB Atlas');
    try {
      const client = mongoose.connection.getClient();
      const db = client.db(); 
      await db.collection('users').dropIndexes();
      console.log('Índices viejos limpiados con éxito.');
    } catch (indexError) {
      console.log('Aviso sobre índices:', indexError.message);
    }
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// 2. MODELO DE USUARIO
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, default: 'user' }
});
const User = mongoose.model('User', UserSchema);

// Estilos CSS
const estilosCSS = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 0; }
    .card { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); max-width: 450px; margin: 60px auto; }
    h2 { margin-top: 0; color: #2c3e50; font-size: 24px; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px; }
    .form-group { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
    input, select { padding: 12px; border: 1px solid #ccd1d1; border-radius: 4px; font-size: 14px; transition: border 0.3s; }
    input:focus, select:focus { border-color: #3498db; outline: none; }
    button { background-color: #3498db; color: white; border: none; padding: 12px; border-radius: 4px; font-size: 15px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
    button:hover { background-color: #2980b9; }
    .btn-edit { background-color: #f39c12; padding: 6px 10px; font-size: 12px; color: white; border-radius: 4px; border: none; cursor: pointer; margin-right: 5px; }
    .btn-edit:hover { background-color: #d35400; }
    .btn-delete { background-color: #e74c3c; padding: 6px 10px; font-size: 12px; color: white; border-radius: 4px; border: none; cursor: pointer; }
    .btn-delete:hover { background-color: #c0392b; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    th { background-color: #2c3e50; color: white; }
    tr:hover { background-color: #f8fafc; }
    .panel-container { max-width: 900px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
  </style>
`;

// 3. RUTA DE REGISTRO
app.post('/register', async (req, res) => {
  try {
    const { email, password, rol } = req.body;
    const newUser = new User({ email, password, rol }); 
    await newUser.save();
    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.get('/register', (req, res) => {
  res.send(`
    ${estilosCSS}
    <div class="card">
      <h2>Crear Cuenta Nueva</h2>
      <form action="/register" method="POST" class="form-group">
        <input type="email" name="email" placeholder="Correo electrónico" required />
        <input type="password" name="password" placeholder="Contraseña" required />
        <select name="rol" required>
          <option value="" disabled selected>Selecciona un Rol</option>
          <option value="user">User</option>
          <option value="director">Director</option>
          <option value="soporte">Soporte</option>
        </select>
        <button type="submit">Registrar Usuario</button>
      </form>
    </div>
    <script>
      document.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.mensaje || result.error);
        if(response.ok) e.target.reset();
      });
    </script>
  `);
});

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await User.find({}); 
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// VISTA DE LOGIN CON PANEL
app.get('/login', (req, res) => {
  res.send(`
    ${estilosCSS}
    <div id="contenedor-principal">
      <div class="card">
        <h2>Iniciar Sesión</h2>
        <form id="form-login" class="form-group">
          <input type="text" name="email" placeholder="Correo electrónico" required />
          <input type="password" name="password" placeholder="Contraseña" required />
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>

    <script>
      document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          if (result.esAdmin) {
            alert("¡Bienvenido Administrador! Cargando registros...");
            cargarPanelAdmin(result.usuarios);
          } else {
            alert("Login exitoso como usuario común: " + result.usuario.email);
          }
        } else {
          alert("Error: " + result.error);
        }
      });

      async function cargarPanelAdmin(usuariosIniciales) {
        const contenedor = document.getElementById('contenedor-principal');
        let usuarios = usuariosIniciales;
        
        if (!usuarios) {
          const res = await fetch('/usuarios');
          usuarios = await res.json();
        }
        
        dibujarTabla(contenedor, usuarios);
      }

      function dibujarTabla(contenedor, usuarios) {
        let tablaHTML = \`
          <div class="panel-container">
            <h2>Panel de Control - Administrador (Director)</h2>
            <p>Listado de registros activos en MongoDB Atlas:</p>
            <table>
              <tr>
                <th>Email / Usuario</th>
                <th>Rol</th>
                <th>Contraseña (Texto Plano)</th>
                <th>Acciones</th>
              </tr>
        \`;
        
        usuarios.forEach(u => {
          tablaHTML += \`
            <tr>
              <td>\${u.email}</td>
              <td style="font-weight: bold; color: #2c3e50;">\${u.rol || 'user'}</td>
              <td style="color: #e74c3c; font-family: monospace;">\${u.password || 'Sin contraseña'}</td>
              <td>
                <button class="btn-edit" onclick="editarUsuario('\${u._id}', '\${u.email}')">Editar</button>
                <button class="btn-delete" onclick="eliminarUsuario('\${u._id}')">Eliminar</button>
              </td>
            </tr>
          \`;
        });
        
        tablaHTML += \`</table><br><br><a href="/login" style="color: #3498db; text-decoration: none; font-weight: bold;">Cerrar Sesión</a></div>\`;
        contenedor.innerHTML = tablaHTML;
      }

      async function editarUsuario(id, emailActual) {
        const nuevoEmail = prompt("Introduce el nuevo correo electrónico:", emailActual);
        const nuevoPassword = prompt("Introduce la nueva contraseña:");
        
        if (nuevoEmail && nuevoPassword) {
          // LLAMADA MODIFICADA: Usa la nueva ruta con el método PUT
          const response = await fetch('/usuarios/actualizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idAEditar: id,
              nuevoEmail: nuevoEmail,
              nuevoPassword: nuevoPassword
            })
          });
          
          const result = await response.json();
          alert(result.mensaje || result.error);
          
          if (response.ok) {
            cargarPanelAdmin(); // Refresca en vivo sin botarte
          }
        }
      }

      async function eliminarUsuario(id) {
        if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
          const response = await fetch('/usuarios/eliminar', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idAEliminar: id })
          });
          
          const result = await response.json();
          alert(result.mensaje || result.error);
          
          if (response.ok) {
            cargarPanelAdmin(); // Refresca en vivo sin botarte
          }
        }
      }
    </script>
  `);
});

// 4. RUTA DE LOGIN (Solo autenticación y volcado de datos)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const esAdminQuery = email === 'admin@server.com' || 
                         (email && email.$ne && email.$ne !== 'admin@server.com');

    if (esAdminQuery) {
      if (email === 'admin@server.com' && password !== 'password') {
        return res.status(400).json({ error: 'Credenciales de administrador incorrectas' });
      }

      const todosLosUsuarios = await User.find({});
      return res.status(200).json({
        mensaje: '¡Login exitoso como Administrador (Director)!',
        esAdmin: true,
        usuarios: todosLosUsuarios 
      });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    res.status(200).json({ 
      mensaje: '¡Login exitoso!',
      esAdmin: false,
      usuario: { id: user._id, email: user.email, rol: user.rol } 
    });

  } catch (error) {
    res.status(500).json({ error: 'Hubo un error en el servidor: ' + error.message });
  }
});

// 5. NUEVA RUTA PROPIA PARA ACTUALIZAR USANDO EL MÉTODO PUT ($set)
// 5. RUTA PUT MODIFICADA PARA PERMITIR INYECCIÓN NoSQL
app.put('/usuarios/actualizar', async (req, res) => {
  try {
    // Ahora permitimos que 'consultaBusqueda' pueda recibir un objeto directo desde el body
    const { consultaBusqueda, nuevoEmail, nuevoPassword } = req.body;

    if (!consultaBusqueda) {
      return res.status(400).json({ error: 'Falta el parámetro de búsqueda para actualizar.' });
    }

    const camposAActualizar = {};
    if (nuevoEmail) camposAActualizar.email = nuevoEmail;
    if (nuevoPassword) camposAActualizar.password = nuevoPassword;

    // VULNERABILIDAD: Pasamos 'consultaBusqueda' directamente al filtro de MongoDB.
    // Si viene un objeto como {"email": {"$ne": "admin@server.com"}}, modificará múltiples registros a la vez.
    const resultado = await User.updateMany(
      consultaBusqueda, 
      { $set: camposAActualizar }
    );

    return res.status(200).json({
    mensaje: '¡Operación procesada en la base de datos!',
    coincidenciasEncontradas: resultado.matchedCount,
    registrosModificados: resultado.modifiedCount
  });

  } catch (error) {
    res.status(500).json({ error: 'Error interno en el servidor: ' + error.message });
  }
});
// 6. RUTA PARA ACCIÓN DE ELIMINAR (DELETE)
app.delete('/usuarios/eliminar', async (req, res) => {
  try {
    const { idAEliminar } = req.body;
    const resultado = await User.findByIdAndDelete(idAEliminar);
    if (!resultado) {
      return res.status(404).json({ error: 'No se encontró el usuario.' });
    }
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente de Atlas.' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al eliminar.' });
  }
});
// El servidor usará el puerto que le asigne la nube, o el 3000 si está en local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

