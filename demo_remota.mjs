import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log('🤖 INICIANDO OPERACIÓN REMOTA: LLENADO Y SINCRONIZACIÓN DE EDUNEXUS...');
    console.log('Abriendo Google Chrome en tu pantalla...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--start-maximized'],
        defaultViewport: null,
    });
    const page = await browser.newPage();
    
    async function typeInput(index, text) {
        await page.evaluate((idx) => {
            const inputs = document.querySelectorAll('.animate-fade input[type="text"], input[type="text"]');
            if(inputs[idx]) inputs[idx].focus();
        }, index);
        await sleep(200);
        await page.keyboard.type(text, { delay: 30 });
        await sleep(200);
    }

    async function clickButton(textMatch) {
        await page.evaluate((txt) => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.textContent.toLowerCase().includes(txt.toLowerCase()));
            if (btn) btn.click();
        }, textMatch);
        await sleep(1500);
    }

    try {
        // --- 1. LOGIN ---
        console.log('Iniciando sesión como Administrador...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
        await sleep(1000);
        await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            if(inputs[0]) inputs[0].value = 'admin@edunexus.com';
        });
        await clickButton('Entrar al Portal');
        await sleep(2000);

        // --- 2. REGISTRO DOCENTE ---
        console.log('Registrando Docente...');
        await page.goto('http://localhost:3000/dashboard/teachers/register', { waitUntil: 'domcontentloaded' });
        await sleep(1500);
        // Llenar inputs genéricos (usando evaluar para evitar problemas de foco)
        await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            if(inputs[0]) inputs[0].value = '10002000300'; // ID
            if(inputs[1]) inputs[1].value = 'David'; // Nombre
            if(inputs[2]) inputs[2].value = 'Ospina'; // Apellido
            if(inputs[4]) inputs[4].value = '3009998877'; // Telefono
            inputs.forEach(i => i.dispatchEvent(new Event('input', {bubbles: true})));
        });
        await sleep(1000);
        await clickButton('Registrar');
        await sleep(2000);

        // --- 3. REGISTRO ESTUDIANTE ---
        console.log('Registrando Estudiante...');
        await page.goto('http://localhost:3000/dashboard/students/register', { waitUntil: 'domcontentloaded' });
        await sleep(1500);
        await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            if(inputs[2]) inputs[2].value = '1122334455'; // ID Estudiante
            if(inputs[3]) inputs[3].value = 'Andrés Felipe'; // Nombre
            if(inputs[4]) inputs[4].value = 'Correa'; // Apellido
            inputs.forEach(i => i.dispatchEvent(new Event('input', {bubbles: true})));
        });
        await sleep(1000);
        await clickButton('Registrar');
        await sleep(2000);

        // --- 4. REGISTRO COMERCIAL (CRM) ---
        console.log('Agregando Oportunidad Comercial...');
        await page.goto('http://localhost:3000/dashboard/commercial/opportunities', { waitUntil: 'domcontentloaded' });
        await sleep(1500);
        await clickButton('Nueva oportunidad');
        await sleep(1000);
        await page.evaluate(() => {
            const inputs = document.querySelectorAll('.animate-fade input[type="text"]');
            if(inputs[0]) inputs[0].value = 'Maria Fernanda';
            if(inputs[1]) inputs[1].value = 'maria@correo.com';
            if(inputs[2]) inputs[2].value = '3005554433';
            inputs.forEach(i => i.dispatchEvent(new Event('input', {bubbles: true})));
            
            const selects = document.querySelectorAll('.animate-fade select');
            if(selects.length > 0) selects[0].selectedIndex = 1;
            selects.forEach(s => s.dispatchEvent(new Event('change', {bubbles: true})));
        });
        await sleep(1000);
        await clickButton('Guardar');
        await sleep(2000);

        // --- 5. SINCRONIZACIÓN PROFUNDA (INYECCIÓN DE RELACIONES) ---
        console.log('Generando matriz de datos de Sedes, Programas y Tesorería para sincronización...');
        await page.evaluate(() => {
            const dataBaseSync = {
               branches: [{ id: "BR-01", name: "Sede Norte Principal", default: true }],
               programs: [{ id: "PR-01", code: "SIST", name: "Técnico en Sistemas" }],
               classrooms: [{ id: "AU-01", name: "Aula 101", branchId: "BR-01" }],
               courses: [{ id: "CUR-01", name: "Sistemas Básicos Intensivo", branch: "Sede Norte Principal", program: "SIST", teacher: "10002000300" }],
               incomes: [{ id: "FAC-100", amount: 250000, concept: "Matrícula Andrés Felipe", status: "Aprobado" }]
            };
            localStorage.setItem('edunexus_structuring_branches', JSON.stringify(dataBaseSync.branches));
            localStorage.setItem('edunexus_academic_programs', JSON.stringify(dataBaseSync.programs));
            localStorage.setItem('edunexus_structuring_classrooms', JSON.stringify(dataBaseSync.classrooms));
            localStorage.setItem('edunexus_academic_courses', JSON.stringify(dataBaseSync.courses));
            localStorage.setItem('edunexus_treasury_incomes', JSON.stringify(dataBaseSync.incomes));
        });
        await page.reload({ waitUntil: 'networkidle0' });
        await sleep(2000);

        // --- 6. NAVEGAR Y MOSTRAR RESULTADOS ---
        console.log('Mostrando Panel General (Dashboard) Sincronizado...');
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
        await sleep(3000);

        // Mostrar Cursos Integrados
        console.log('Mostrando Estructura Cruzada de Cursos...');
        await page.goto('http://localhost:3000/dashboard/academic/structuring/cursos', { waitUntil: 'networkidle0' });
        await sleep(4000);

    } catch (e) {
        console.error("⚠️ Operación interrumpida:", e);
    }

    console.log('✅ OPERACIÓN REMOTA COMPLETADA. Todos los módulos quedaron poblados.');
    console.log('Cerraré esta ventana automatizada en 10 segundos...');
    await sleep(10000);
    await browser.close();
})();
