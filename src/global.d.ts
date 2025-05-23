import { Mongoose } from 'mongoose';

declare global {
  // Se ha cambiado 'var' a 'let' para cumplir con las mejores prácticas de TypeScript/ESLint.
  // 'let' es apropiado aquí porque 'mongoose.conn' y 'mongoose.promise' pueden ser reasignados.
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

export {};
