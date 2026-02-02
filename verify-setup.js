// Script de verificación para el portal de educación
// Ejecuta con: node verify-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del Portal de Educación...\n');

let allGood = true;

// 1. Verificar que exista .env.local
console.log('1️⃣ Verificando archivo .env.local...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('   ✅ Archivo .env.local encontrado');
  
  // Leer y verificar las variables
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'MONGODB_URI'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName + '=') || 
        envContent.includes(varName + '=your_') ||
        envContent.includes(varName + '=pk_test_your_') ||
        envContent.includes(varName + '=sk_test_your_')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('   ⚠️  Variables no configuradas:');
    missingVars.forEach(v => console.log(`      - ${v}`));
    allGood = false;
  } else {
    console.log('   ✅ Todas las variables requeridas están configuradas');
  }
} else {
  console.log('   ❌ Archivo .env.local NO encontrado');
  console.log('   📝 Copia .env.local.example a .env.local y configura tus keys');
  allGood = false;
}

// 2. Verificar páginas de autenticación
console.log('\n2️⃣ Verificando páginas de autenticación...');
const signInPath = path.join(__dirname, 'src', 'app', 'sign-in', '[[...sign-in]]', 'page.tsx');
const signUpPath = path.join(__dirname, 'src', 'app', 'sign-up', '[[...sign-up]]', 'page.tsx');

if (fs.existsSync(signInPath)) {
  console.log('   ✅ Página de Sign-In creada');
} else {
  console.log('   ❌ Página de Sign-In NO encontrada');
  allGood = false;
}

if (fs.existsSync(signUpPath)) {
  console.log('   ✅ Página de Sign-Up creada');
} else {
  console.log('   ❌ Página de Sign-Up NO encontrada');
  allGood = false;
}

// 3. Verificar estructura de educación
console.log('\n3️⃣ Verificando estructura del portal de educación...');
const educationPaths = [
  'src/app/education/page.tsx',
  'src/app/education/admin/page.tsx',
  'src/app/education/student/page.tsx',
  'src/app/api/education/role/route.ts',
  'src/app/api/education/classrooms/route.ts',
  'src/mongoDB/models/classroom.ts',
  'src/types/education.ts',
  'src/lib/utils/auth.ts'
];

let missingFiles = [];
educationPaths.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push(filePath);
  }
});

if (missingFiles.length === 0) {
  console.log('   ✅ Todos los archivos del portal están presentes');
} else {
  console.log('   ⚠️  Archivos faltantes:');
  missingFiles.forEach(f => console.log(`      - ${f}`));
  allGood = false;
}

// 4. Verificar middleware
console.log('\n4️⃣ Verificando middleware...');
const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
  if (middlewareContent.includes('isProtectedRoute') && 
      middlewareContent.includes('/education(.*)')) {
    console.log('   ✅ Middleware configurado correctamente');
  } else {
    console.log('   ⚠️  Middleware puede necesitar actualización');
  }
} else {
  console.log('   ❌ Middleware NO encontrado');
  allGood = false;
}

// 5. Verificar package.json
console.log('\n5️⃣ Verificando dependencias...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const requiredDeps = [
    '@clerk/nextjs',
    'mongoose',
    'framer-motion',
    'lucide-react'
  ];
  
  let missingDeps = [];
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log('   ✅ Todas las dependencias requeridas instaladas');
  } else {
    console.log('   ⚠️  Dependencias faltantes:');
    missingDeps.forEach(d => console.log(`      - ${d}`));
    console.log('   💡 Ejecuta: npm install');
    allGood = false;
  }
}

// Resumen final
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Asegúrate de tener las keys de Clerk en .env.local');
  console.log('   2. Ejecuta: npm run dev');
  console.log('   3. Ve a: http://localhost:3000');
  console.log('   4. Haz clic en "Educación remota"');
  console.log('   5. Crea una cuenta o inicia sesión');
} else {
  console.log('⚠️  HAY PROBLEMAS QUE NECESITAN ATENCIÓN');
  console.log('\n📚 Consulta estos archivos para ayuda:');
  console.log('   - FIX_SIGNIN_ERROR.md (solución del error 404)');
  console.log('   - INSTALLATION.md (instalación completa)');
  console.log('   - QUICKSTART_GUIDE.md (guía de uso)');
}
console.log('='.repeat(50) + '\n');
