import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SignupCongregacaoData, SignupUsuarioData } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo } = body

    if (tipo === 'congregacao') {
      return await criarCongregacao(body as SignupCongregacaoData)
    } else if (tipo === 'usuario') {
      return await criarUsuario(body as SignupUsuarioData)
    } else {
      return NextResponse.json(
        { error: 'Tipo de signup inválido' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erro no signup:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function criarCongregacao(data: SignupCongregacaoData) {
  const { congregacao, responsavel } = data

  // Validações básicas
  if (responsavel.senha !== responsavel.confirmarSenha) {
    return NextResponse.json(
      { error: 'As senhas não coincidem' },
      { status: 400 }
    )
  }

  if (responsavel.senha.length < 8) {
    return NextResponse.json(
      { error: 'A senha deve ter pelo menos 8 caracteres' },
      { status: 400 }
    )
  }

  try {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: responsavel.email,
      password: responsavel.senha,
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      
      // Tratamento específico para rate limit
      if (authError.status === 429 || authError.code === 'over_email_send_rate_limit') {
        return NextResponse.json(
          { error: 'Muitas tentativas de cadastro. Aguarde alguns segundos e tente novamente.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // 2. Verificar se o número único já existe
    const { data: existingCong, error: checkError } = await supabase
      .from('congregacoes')
      .select('id')
      .eq('numero_unico', congregacao.numeroUnico)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar número único:', checkError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Erro ao verificar número único' },
        { status: 500 }
      )
    }

    if (existingCong) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Este número único já está em uso' },
        { status: 400 }
      )
    }

    // 3. Criar congregação
    const { data: congregacaoData, error: congregacaoError } = await supabase
      .from('congregacoes')
      .insert({
        nome: congregacao.nome,
        cidade: congregacao.cidade,
        numero_unico: congregacao.numeroUnico,
      })
      .select()
      .single()

    if (congregacaoError) {
      console.error('Erro ao criar congregação:', congregacaoError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Erro ao criar congregação' },
        { status: 500 }
      )
    }

    // 4. Criar usuário admin
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        congregacao_id: congregacaoData.id,
        nome: responsavel.nome,
        telefone: responsavel.telefone || null,
        role: 'admin',
      })

    if (usuarioError) {
      console.error('Erro ao criar usuário admin:', usuarioError)
      
      // Se deu erro, remove o usuário criado no auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Erro ao criar usuário administrador' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Congregação criada com sucesso!',
      data: {
        congregacao_id: congregacaoData.id,
        numero_unico: congregacaoData.numero_unico,
        user_id: authData.user.id,
      },
    })
  } catch (error) {
    console.error('Erro ao criar congregação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function criarUsuario(data: SignupUsuarioData) {
  const { usuario } = data

  // Validações básicas
  if (usuario.senha !== usuario.confirmarSenha) {
    return NextResponse.json(
      { error: 'As senhas não coincidem' },
      { status: 400 }
    )
  }

  if (usuario.senha.length < 8) {
    return NextResponse.json(
      { error: 'A senha deve ter pelo menos 8 caracteres' },
      { status: 400 }
    )
  }

  try {
    // 1. Verificar se a congregação existe
    const { data: congregacaoData, error: congregacaoError } = await supabase
      .from('congregacoes')
      .select('id')
      .eq('numero_unico', usuario.codigoCongregacao)
      .single()

    if (congregacaoError || !congregacaoData) {
      return NextResponse.json(
        { error: 'Código da congregação inválido' },
        { status: 400 }
      )
    }

    // 2. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: usuario.email,
      password: usuario.senha,
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      
      // Tratamento específico para rate limit
      if (authError.status === 429 || authError.code === 'over_email_send_rate_limit') {
        return NextResponse.json(
          { error: 'Muitas tentativas de cadastro. Aguarde alguns segundos e tente novamente.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // 3. Criar registro na tabela usuarios
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        congregacao_id: congregacaoData.id,
        nome: usuario.nome,
        telefone: usuario.telefone || null,
        role: 'membro',
      })

    if (usuarioError) {
      console.error('Erro ao criar registro do usuário:', usuarioError)
      
      // Se deu erro, remove o usuário criado no auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        user_id: authData.user.id,
        congregacao_id: congregacaoData.id,
      },
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}