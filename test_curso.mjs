import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  const artifactsDir = 'C:\\Users\\JoshuaGamingTV\\.gemini\\antigravity\\brain\\e4777987-5713-491b-849a-98536063a1b6';
  console.log('Starting local browser automated test...');
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  try {
      console.log('1. Loading demo data /demo-init...');
      await page.goto('http://localhost:3000/demo-init', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 3000)); 

      // ----------------------------------------------------
      // SEDE & JORNADA
      // ----------------------------------------------------
      console.log('2. Testing SEDE creation...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/sede-jornada', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, ));

      // Create Sede
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nueva sede'));
          if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, ));
      
      // Fill Sede Form
      await page.evaluate(() => {
          const inputs = document.querySelectorAll('.animate-fade input[type="text"]');
          if (inputs.length > 0) {
              inputs[0].value = 'SEDE BOGOTÁ';
              inputs[0].dispatchEvent(new Event('input', { bubbles: true })); // This triggers React state update
              inputs[1].value = 'Calle 100 # 15-20';
              inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          }
      });
      await new Promise(r => setTimeout(r, ));
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent.includes('Guardar'));
          if(save) save.click();
      });
      await new Promise(r => setTimeout(r, ));
      await page.screenshot({ path: artifactsDir + '\\test_01_sede_creada.webp' });

      console.log('3. Testing JORNADA creation...');
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nueva jornada'));
          if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, ));
      
      // Select Sede Bogota
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if(selects.length > 0) {
             const options = Array.from(selects[0].options);
             const target = options.find(o => o.textContent.includes('SEDE BOGOTÁ'));
             if (target) {
                 selects[0].value = target.value;
                 selects[0].dispatchEvent(new Event('change', { bubbles: true }));
             }
             if (selects[1]) {
                 selects[1].value = 'Noche';
                 selects[1].dispatchEvent(new Event('change', { bubbles: true }));
             }
          }
      });
      await new Promise(r => setTimeout(r, ));
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent.includes('Guardar'));
          if(save) save.click();
      });
      await new Promise(r => setTimeout(r, ));
      
      console.log('4. Assigning Program to Jornada...');
      await page.evaluate(() => {
         const sels = document.querySelectorAll('select.input-premium');
         const options = Array.from(sels[0].options);
         const target = options.find(o => o.textContent.includes('SEDE BOGOTÁ - Noche'));
         if(target) {
             sels[0].value = target.value;
             sels[0].dispatchEvent(new Event('change', { bubbles: true })); // Triggers handleSedeJornadaChange
         }
      });
      await new Promise(r => setTimeout(r, ));
      
      // Click Asignar programas
      await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('button'));
         const btn = btns.find(b => b.textContent.includes('Asignar programas'));
         if(btn) btn.click();
      });
      await new Promise(r => setTimeout(r, ));
      
      // Click the first program checkbox (Técnico Laboral en Sistemas)
      await page.evaluate(() => {
         const modals = document.querySelectorAll('.animate-fade');
         if (modals.length > 0) {
             const lastModal = modals[modals.length - 1];
             const items = lastModal.querySelectorAll('div[style*="cursor: pointer"]');
             if(items.length > 0) items[0].click();
         }
      });
      await new Promise(r => setTimeout(r, ));
      
      await page.evaluate(() => {
          const modals = document.querySelectorAll('.animate-fade');
          if (modals.length > 0) {
              const lastModal = modals[modals.length - 1];
              const save = Array.from(lastModal.querySelectorAll('button')).find(b => b.textContent.includes('Guardar'));
              if(save) save.click();
          }
      });
      await new Promise(r => setTimeout(r, ));
      await page.screenshot({ path: artifactsDir + '\\test_02_programas_asignados.webp' });

      // ----------------------------------------------------
      // CURSO
      // ----------------------------------------------------
      console.log('5. Creating Curso...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/cursos', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, ));
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Crear curso'));
          if(btn) btn.click();
      });
      await new Promise(r => setTimeout(r, ));

      // Fill form part 1
      await page.evaluate(() => {
          const inputs = document.querySelectorAll('.animate-fade input[type="text"]');
          if (inputs.length >= 2) {
              inputs[0].value = 'CUR-BOG-2026'; 
              inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
              inputs[1].value = 'SISTEMAS INTENSIVO NOCHE'; 
              inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 0 && selects[0].options.length > 1) {
              selects[0].selectedIndex = 1; // Docente (any)
              selects[0].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await new Promise(r => setTimeout(r, ));
      
      // Sede Jornada
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 1) {
              const sjOptions = Array.from(selects[1].options);
              const sjTarget = sjOptions.find(o => o.textContent.includes('SEDE BOGOTÁ - Noche'));
              if(sjTarget) {
                  selects[1].value = sjTarget.value;
                  selects[1].dispatchEvent(new Event('change', { bubbles: true }));
              }
          }
      });
      await new Promise(r => setTimeout(r, )); 
      
      // Programa
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 2 && selects[2].options.length > 1) {
              selects[2].selectedIndex = 1; // Primer Programa disponible para esa Sede-Jornada
              selects[2].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await new Promise(r => setTimeout(r, )); 
      
      // Pensum & Asignatura
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 3 && selects[3].options.length > 1) {
              selects[3].selectedIndex = 1; // PENSUM PRINCIPAL
              selects[3].dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (selects.length > 4 && selects[4].options.length > 1) {
              selects[4].selectedIndex = 1; // 1ra Asignatura del Pensum
              selects[4].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await new Promise(r => setTimeout(r, ));
      
      // Dates & Capacity
      await page.evaluate(() => {
          const cupoInput = document.querySelector('.animate-fade input[type="number"]');
          if (cupoInput) {
              cupoInput.value = '35';
              cupoInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          const dateInputs = document.querySelectorAll('.animate-fade input[type="date"]');
          if (dateInputs.length >= 2) {
              dateInputs[0].value = '2026-06-01'; 
              dateInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
              dateInputs[1].value = '2026-11-30'; 
              dateInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          }
      });
      await new Promise(r => setTimeout(r, ));
      
      // SCREENSHOT THE FILLED FORM
      await page.screenshot({ path: artifactsDir + '\\test_03_formulario_curso.webp' });

      // SAVE
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent.includes('Aceptar'));
          if(save) save.click();
      });
      await new Promise(r => setTimeout(r, ));
      
      // SCREENSHOT THE LIST
      await page.screenshot({ path: artifactsDir + '\\test_04_resultado_cursos.webp' });
      
  } catch (err) {
      console.error('Test Failed:', err);
      await page.screenshot({ path: artifactsDir + '\\test_ERROR.webp' });
  }

  await browser.close();
  console.log('TEST COMPLETED SUCCESSFULLY!');
})();
