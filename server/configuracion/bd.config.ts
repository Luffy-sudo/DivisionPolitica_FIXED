/**
 * Configuración de Base de Datos
 * Soporta MongoDB local, MongoDB Atlas / remoto vía MONGODB_URI o fallback en memoria.
 */
export const configBD = {
  SERVIDOR: process.env.DB_HOST || '127.0.0.1',
  PUERTO: process.env.DB_PORT || '27017',
  BASEDATOS: process.env.DB_NAME || 'divisionpolitica',
  USUARIO: process.env.DB_USER || '',
  CLAVE: process.env.DB_PASS || '',
  get url(): string {
    if (process.env.MONGODB_URI) {
      return process.env.MONGODB_URI;
    }
    const auth = this.USUARIO && this.CLAVE ? `${this.USUARIO}:${this.CLAVE}@` : '';
    return `mongodb://${auth}${this.SERVIDOR}:${this.PUERTO}/${this.BASEDATOS}`;
  }
};
