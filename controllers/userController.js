const User = require('../models/User')
const crypto = require('crypto')
const mailHandler = require('../handlers/mailHandler')

exports.login = (req, res) => {
    res.render("login")
}

exports.loginAction = (req, res) => {
    const auth = User.authenticate()

    auth(req.body.email, req.body.password, (error, result) => {
        if (!result) {
            req.flash('error', 'Seus e-mail e/ou senha estão errados!')
            res.redirect('/users/login')
            return
        }

        req.login(result, () => { })

        req.flash('success', 'Loguin efetuado!')
        res.redirect('/')
    })
}

exports.register = (req, res) => {
    res.render('register')
}

exports.registerAction = (req, res) => {
    const newUser = new User(req.body)
    User.register(newUser, req.body.password, (error) => {
        if (error) {
            req.flash('error', 'Ocorreu um erro, tente novamente.')
            res.redirect('/users/register')
            return
        }
        req.flash('success', 'Registro efetuado com sucesso.')
        res.redirect('/users/login')
    })
}

exports.logout = (req, res) => {
    req.logout()
    res.redirect('/')
}

exports.profile = (req, res) => {
    res.render('profile')
}

exports.profileAction = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { name: req.body.name, email: req.body.email },
            { new: true, runValidators: true }
        )
    } catch (e) {
        req.flash('error', `Ocorreu um erro: ${e.message}`)
        res.redirect('/profile')
    }
    req.flash('success', 'Dados atualizados com sucesso!')
    res.redirect('/profile')
}

exports.forget = (req, res) => {
    res.render('forget')
}

exports.forgetAction = async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).exec()
    if (!user) {
        req.flash('error', 'e-mail não cadastrado')
        res.redirect('/users/forget')
        return
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hora
    await user.save()

    const resetLink = `http://${req.headers.host}/users/resert/${user.resetPasswordToken}`
    const to = `${user.name} <${user.email}>`
    const html = `Testando e-mail com link: <br> <a href="${resetLink}">Recuperar sua senha<a/>`
    const text = `Testando e-mail com o link ${resetLink}`

    mailHandler.send({
        to,
        subject: 'Resertar sua senha',
        html,
        text

    })

    req.flash('success', 'Te enviamos um e-mail com as instruções. ')
    res.redirect('/users/login')
}

exports.forgetToken = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }).exec()
    if (!user) {
        req.flash('error', 'Token expirado!')
        res.redirect('/users/forget')
        return
    }

    res.render('forgetPassword')
}

exports.forgetTokenAction = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }).exec()
    if (!user) {
        req.flash('error', 'Token expirado!')
        res.redirect('/users/forget')
        return
    }

    if (req.body.password != req.body['password-confirm']) {
        req.flash('error', 'As senhas não confere')
        res.redirect('back')
        return
    }


    user.setPassword(req.body.password, async () => {
        await user.save()
        req.flash('success', 'Senha alterada com sucesso')
        res.redirect('/')
    })
}