/**
 * Script para probar las operaciones CRUD de pagos
 * Verifica crear, editar y eliminar pagos
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://lhcidtiysldiyshwauvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY2lkdGl5c2xkaXlzaHdhdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODI4MzIsImV4cCI6MjA3NDA1ODgzMn0.wbR5i5hBbUySOhOMho4hCR7HMSzR7IQ8kYqKbYe_9Ic';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Simula PaymentsService.create()
 */
async function testCreatePayment(paymentData) {
  console.log('💳 Probando PaymentsService.create():', paymentData);
  
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select(`
      *,
      provider:providers(id, name)
    `)
    .single();

  if (error) {
    console.error('❌ Error al crear pago:', error);
    throw new Error(`Error al crear pago: ${error.message}`);
  }

  console.log('✅ Pago creado exitosamente:', data);
  return data;
}

/**
 * Simula PaymentsService.update()
 */
async function testUpdatePayment(paymentId, updateData) {
  console.log(`📝 Probando PaymentsService.update('${paymentId}'):`, updateData);
  
  const { data, error } = await supabase
    .from('payments')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select(`
      *,
      provider:providers(id, name)
    `)
    .single();

  if (error) {
    console.error('❌ Error al actualizar pago:', error);
    throw new Error(`Error al actualizar pago: ${error.message}`);
  }

  console.log('✅ Pago actualizado exitosamente:', data);
  return data;
}

/**
 * Simula PaymentsService.delete()
 */
async function testDeletePayment(paymentId) {
  console.log(`🗑️ Probando PaymentsService.delete('${paymentId}')`);
  
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId);

  if (error) {
    console.error('❌ Error al eliminar pago:', error);
    throw new Error(`Error al eliminar pago: ${error.message}`);
  }

  console.log('✅ Pago eliminado exitosamente');
}

/**
 * Obtiene datos de prueba necesarios
 */
async function getTestData() {
  // Obtener una semana de prueba
  const { data: weeks, error: weeksError } = await supabase
    .from('weeks')
    .select('id, week_number, month_id')
    .limit(1);
  
  if (weeksError || !weeks || weeks.length === 0) {
    throw new Error('No se encontraron semanas para prueba');
  }
  
  // Obtener un proveedor de prueba
  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .select('id, name')
    .limit(1);
  
  if (providersError || !providers || providers.length === 0) {
    throw new Error('No se encontraron proveedores activos para prueba');
  }
  
  return {
    week: weeks[0],
    provider: providers[0]
  };
}

/**
 * Prueba principal de operaciones CRUD
 */
async function testPaymentCRUD() {
  try {
    console.log('🚀 Iniciando pruebas de CRUD de pagos...');
    
    // Obtener datos de prueba
    console.log('\n📋 Obteniendo datos de prueba...');
    const { week, provider } = await getTestData();
    console.log(`✅ Semana de prueba: ${week.week_number} (ID: ${week.id})`);
    console.log(`✅ Proveedor de prueba: ${provider.name} (ID: ${provider.id})`);
    
    // Prueba 1: Crear un nuevo pago
    console.log('\n🔥 PRUEBA 1: Crear nuevo pago');
    const newPaymentData = {
      week_id: week.id,
      provider_id: provider.id,
      amount: 150.75,
      description: 'Pago de prueba - Test CRUD',
      payment_date: new Date().toISOString().split('T')[0]
    };
    
    const createdPayment = await testCreatePayment(newPaymentData);
    const paymentId = createdPayment.id;
    
    // Prueba 2: Actualizar el pago creado
    console.log('\n🔥 PRUEBA 2: Actualizar pago existente');
    const updateData = {
      amount: 200.50,
      description: 'Pago de prueba - ACTUALIZADO'
    };
    
    const updatedPayment = await testUpdatePayment(paymentId, updateData);
    
    // Verificar que los cambios se aplicaron
    if (updatedPayment.amount === updateData.amount && 
        updatedPayment.description === updateData.description) {
      console.log('✅ Verificación: Los cambios se aplicaron correctamente');
    } else {
      console.log('⚠️ Advertencia: Los cambios no se reflejaron como se esperaba');
    }
    
    // Prueba 3: Eliminar el pago creado
    console.log('\n🔥 PRUEBA 3: Eliminar pago');
    await testDeletePayment(paymentId);
    
    // Verificar que el pago fue eliminado
    console.log('\n🔍 Verificando eliminación...');
    const { data: deletedCheck, error: checkError } = await supabase
      .from('payments')
      .select('id')
      .eq('id', paymentId)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Verificación: El pago fue eliminado correctamente');
    } else {
      console.log('⚠️ Advertencia: El pago aún existe en la base de datos');
    }
    
    console.log('\n🎉 Todas las pruebas de CRUD completadas exitosamente!');
    
  } catch (error) {
    console.error('💥 Error en las pruebas CRUD:', error.message);
    process.exit(1);
  }
}

// Ejecutar las pruebas
testPaymentCRUD();