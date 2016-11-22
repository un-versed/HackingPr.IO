var usr_prompt,
    socket,
    och_chat,
    chatTerm,
    locked_target,
    prompt_active,
    answering = false,
    problemObj;
jQuery(document).ready(function ($) {
    var chatTerm = $('#chat').terminal(function (command, term) {
    }, {
            greetings: '',
            prompt: '',
            name: 'chat',
            exit: false
        });
    var testo,
        anim = false,
        timer,
        prompt,
        string;
    ioConnect();
    function typed(finish_typing) {
        return function (term, message, delay, finish) {
            anim = true;
            var prompt = term.get_prompt();
            var c = 0;
            if (message.length > 0) {
                term.set_prompt('');
                var interval = setInterval(function () {
                    term.insert(message[c++]);
                    if (c == message.length) {
                        clearInterval(interval);
                        // execute in next interval
                        setTimeout(function () {
                            // swap command with prompt
                            finish_typing(term, message, prompt);
                            anim = false
                            finish && finish();
                        }, delay);
                    }
                }, delay);
            }
        };
    }
    var typed_prompt = typed(function (term, message, prompt) {
        // swap command with prompt
        term.set_command('');
        term.set_prompt(message + ' ');
    });
    var typed_message = typed(function (term, message, prompt) {
        term.set_command('');
        term.echo(message)
        term.set_prompt(prompt);
    });

    var terminal = $('body').terminal(function (command, term) {
        command = command.toLowerCase();
        var multCom = hasWhiteSpace(command);
        if (answering == true) {
            if ($.isNumeric(command)) {
                if (command == problemObj.result) {
                    term.echo("[[b;green;]correct answer]");
                    answering = false;
                    problemObj = null;
                    upgradeTrojanlvl(term)

                } else {
                    term.echo("[[b;green;]incorrect answer]");
                }
            }
        } else {
            if (command == 'ip') {
                term.echo("ip <command> <ip_address>");
                return;
            } else if (command == 'trj') {
                term.echo("trj <create, list, upgrade>");
                return;
            } else if (command == 'msg') {
                term.echo("msg <ip_address> <msg>")
                return;
            } else if (command == 'och') {
                term.echo("och join #<room>");
                return;
            } else if (term.get_prompt().trim().split("@").slice(0, 1).join("@") == 'och') {
                term.clear();
                if (command == 'exit') {
                    leaveOch(term, och_chat, chatTerm);
                } else {
                    sendOchMsg(term, och_chat, command);
                }
                return;
            } else if (prompt_active == "locked") {
                if (command == 'exit') {
                    prompt_active = '';
                    term.set_prompt('$> ');
                } else {
                    if (multCom != false) {
                        if (multCom[0] == 'crack') {
                            if (multCom[1] == 'pwd') {
                                if (multCom[2] == undefined || multCom[2].trim() == '') {
                                    term.echo("crack pwd <hash-type>");
                                } else {
                                    crackPwd(term, locked_target, multCom[2].trim());
                                }
                            }
                        }
                    }
                }
                return;
            }

            if (multCom != false) {
                //Multi Param Cmd
                if (multCom[0] == 'ip') {
                    if (multCom[1] == 'check') {
                        checkIp(multCom[2], term);
                    } else if (multCom[1] == 'lock') {
                        if (multCom[2] == undefined || multCom[2].trim() == '') {
                            term.echo("ip lock <ip_address>");
                        } else {
                            lockTarget(multCom[2].trim(), term);
                        }
                    } else {
                        term.echo("ip <command> <ip_address>");
                    }

                } else if (multCom[0] == 'trj') {
                    if (multCom[1] == 'list') {
                        getTrojanList(term);
                    } else if (multCom[1] == 'create') {
                        if (multCom[2] == undefined || multCom[2].trim() == '') {
                            term.echo("trj create <trojan_name>");
                        } else {
                            console.log('create', multCom[2].trim())
                            createTrojan(term, multCom[2].trim());
                        }

                    } else if (multCom[1] == 'upgrade') {
                        if (multCom[2] == undefined || multCom[2].trim() == '') {
                            term.echo("trj upgrade <trojan_name>");
                        } else {
                            console.log('upgrade', multCom[2].trim())
                            upgradeTrojan(term, multCom[2].trim());
                        }
                    }
                } else if (multCom[0] == 'msg') {
                    if (multCom[1] != undefined || multCom[1].trim() != '') {
                        if (multCom[2] == undefined || multCom[2].trim() == '') {
                            term.echo("msg <ip_address> <msg>");
                        } else {
                            console.log('send_msg', multCom[2])
                            sendPvt(term, multCom[1], command.split(" ").slice(2, 300).join(" "));
                        }

                    } else {
                        term.echo("msg <ip_address> <msg>")
                    }
                } else if (multCom[0] == 'och') {
                    if (multCom[2] == undefined || multCom[2].trim() == '') {
                        term.echo("msg join <room>");
                    } else {
                        joinChat(term, multCom[2]);
                    }
                } else {
                    term.echo("unknown command");
                }
            } else {
                //One param Cmd
                if (command == 'welcome') {
                    var msg = 'Welcome to hAckPr - Online hacking game.'
                    // typed_message(term, msg, 70, function () { });
                    term.set_prompt('welcome >');
                } else if (command == 'logout') {
                    term.logout();
                    term.echo("You logged off");
                } else if (command == "help") {
                    term.echo('Visit http://www.google.com')
                } else {
                    term.echo("unknown command");
                }
            }

        }
    }, {
            login: function (user, password, callback) {
                $.post('./php/connect.php', {
                    usr: user,
                    pwd: password,
                    sid: socket.id
                },
                    function (data) {
                        console.log(data)
                        if (data == 1) {

                            callback("AUTHENTICATION TOKEN");
                        } else {
                            callback(null);
                        }
                    });
            },
            greetings: 'Δ Hacking - The Project Δ',
            prompt: '$> ',
            name: 'hAckingPr',
            exit: false
        });

    $(window).unload(function () {
        terminal.logout();
    });

    console.log(chance.ip())
    //SOCKET IO EVENTS
    socket.on("new:msg", function (sender_ip, msg) {
        console.log(sender_ip)
        chatTerm.echo("[[[b;purple;]" + sender_ip + "][[b;green;]~]] " + msg)
    });
    socket.on("new:usr:room", function (sender_ip) {
        console.log(sender_ip)
        chatTerm.echo("[[[b;purple;]" + sender_ip + "][[b;green;]~]] " + 'Connected')
    });
    socket.on("left:room", function (sender_ip) {
        console.log(sender_ip)
        chatTerm.echo("[[[b;purple;]" + sender_ip + "][[b;red;]~]] " + 'Disconnected')
    });
    socket.on('problem:response', function (problem) {
        answering = true;
        problemObj = problem;
        terminal.echo("[[b;red;] " + problemObj.problem + ']');
    });

});


//Functions Area
function lockTarget(target, term) {
    $.post('./php/commands.php', {
        cmd: 'lock_target',
        target: target
    }, function (data) {
        console.log(data)
        if (data == 1) {
            locked_target = target;
            prompt_active = "locked";
            createLockProgress(term, 50, 100, target);
        } else {
            createLockProgressFail(term, 50, 100, target);
        }
    });

}

function crackPwd(term, target, pwd) {
    $.post('./php/commands.php', {
        cmd: 'crack_pwd',
        target: target,
        pwd: pwd
    }, function (data) {
        console.log(data)
        if (data == 1) {
            createProgress(term, 30, 100, "[[b;green;]crack succefful! logged in]");
        } else {
            createProgress(term, 30, 100, "[[b;red;]crack failed]");
        }
    });

}

function leaveOch(term, room, term2) {
    $('#chat').hide();
    term.clear();
    term2.clear();
    socket.emit('left:room', room);
    term.set_prompt('$> ');
}

function joinChat(term, room) {
    $('#chat').show();
    term.clear();
    och_chat = room;
    socket.emit('join:room', room);
    term.set_prompt('och@' + room + '> ');
}
function ioConnect() {
    socket = io('localhost:3000');
}

function sendOchMsg(term, room, msg) {
    console.log(room.replace('>', ''))
    socket.emit('new:room:msg', room.replace('>', ''), msg)
}

function sendPvt(term, ip_address, msg) {
    $.post('./php/socketConnect.php', {
        cmd: 'new:msg',
        ip_address: ip_address,
        msg: msg
    });
}

function progress(percent, width) {
    var size = Math.round(width * percent / 100);
    var left = '', taken = '', i;
    for (i = size; i--;) {
        taken += '=';
    }
    if (taken.length > 0) {
        taken = taken.replace(/=$/, '>');
    }
    for (i = width - size; i--;) {
        left += ' ';
    }
    return '[' + taken + left + '] ' + percent + '%';
}

function lockProgress(percent, width) {
    var size = Math.round(width * percent / 100);
    var left = '', taken = '', i;
    for (i = size; i--;) {
        taken += '=';
    }
    if (taken.length > 0) {
        taken = taken.replace(/=$/, '>');
    }
    for (i = width - size; i--;) {
        left += ' ';
    }
    return '[[b;purple;]LOCKING TARGET] [' + taken + left + '] ' + percent + '%';
}

function createProgress(term, totalTime, totalSize, s) {
    var i = 0, size = 100;
    prompt = term.get_prompt();
    string = progress(0, size);
    term.set_prompt(progress);
    animation = true;
    (function loop() {
        string = progress(i++, size);
        term.set_prompt(string);
        if (i < 100) {
            timer = setTimeout(loop, totalTime);
        } else {
            term.echo(progress(i, size) + ' [[b;green;]OK]')
                .echo(s)
                .set_prompt(prompt);
        }
    })();
}

function createProgresslvl(term, totalTime, totalSize, s, data) {
    console.log(data)
    var i = 0, size = 100;
    prompt = term.get_prompt();
    string = progress(0, size);
    term.set_prompt(progress);
    animation = true;
    var trjList = "+-----------------------+";
    $.each(data, function (index, value) {
        trjList += "\n\nTrojan Name: " + value['trj_name'] +
            "\nTrojan Level: " + value['trj_lvl'] + "\n" +
            "\n+-----------------------+";
        console.log(value);

    });
    (function loop() {
        string = progress(i++, size);
        term.set_prompt(string);
        if (i < 100) {
            timer = setTimeout(loop, totalTime);
        } else {
            term.echo(progress(i, size) + ' [[b;green;]OK]')
                .echo(s)
                .set_prompt(prompt)
                .echo(trjList);
        }
    })();
}


function createLockProgress(term, totalTime, totalSize, s) {
    var i = 0, size = 100;
    prompt = term.get_prompt();
    string = lockProgress(0, size);
    term.set_prompt(lockProgress);
    animation = true;
    (function loop() {
        string = lockProgress(i++, size);
        term.set_prompt(string);
        if (i < 100) {
            timer = setTimeout(loop, totalTime);
        } else {
            term.echo(lockProgress(i, size) + ' [[b;green;]LOCKED]')
                .set_prompt('' + s + '~> ');
        }
    })();
}

function createLockProgressFail(term, totalTime, totalSize, s) {
    var i = 0, size = 100;
    prompt = term.get_prompt();
    string = lockProgress(0, size);
    term.set_prompt(lockProgress);
    animation = true;
    (function loop() {
        string = lockProgress(i++, size);
        term.set_prompt(string);
        if (i < 100) {
            timer = setTimeout(loop, totalTime);
        } else {
            term.echo(lockProgress(i, size) + ' [[b;red;]FAIL]')
                .set_prompt('$> ');
        }
    })();
}



function checkIp(ip, term) {
    $.post('./php/commands.php', {
        cmd: 'ip_check',
        ip: ip
    },
        function (data) {
            if (data == 0) {
                term.echo("[[b;red;]WRONG IP ADDRESS]");
            } else {
                data = JSON.parse(data)
                console.log(data)
                createProgress(term, 30, 100, "+-----------------------+" +
                    "\nComputer's IP: " + ip + "\nLocation: " + data[0]['local'] +
                    "\nComputer's Firewall: " + data[0]['firewall'] + "\nComputer's Antivirus: " + data[0]['antivirus'] +
                    "\n+-----------------------+");
            }
        });
}

function getTrojanList(term) {
    $.post('./php/commands.php', {
        cmd: 'trj_list',
    },
        function (data) {
            console.log(data)
            if (data == 0) {
                term.echo("[[b;red;]ERROR GETTING TROJAN LIST]");
            } else {
                var trjList = "+-----------------------+";
                data = JSON.parse(data);
                $.each(data, function (index, value) {
                    trjList += "\n\nTrojan Name: " + value['trj_name'] +
                        "\nTrojan Level: " + value['trj_lvl'] + "\n" +
                        "\n+-----------------------+";
                    console.log(value);

                });
                term.echo(trjList);
            }
        });
}

function createTrojan(term, trj_name) {
    $.post('./php/commands.php', {
        cmd: 'trj_create',
        trj_name: trj_name
    },
        function (data) {
            console.log(data)
            if (data == 0) {
                term.echo("[[b;red;]ERROR CREATING TROJAN]");
            } else {
                createProgress(term, 30, 100, "[[b;green;]trojan create success]");
            }
        });
}

function upgradeTrojan(term, trj_name) {
    if (trj_name.indexOf('.sh') !== - 1) {
        trj_name = trj_name;
    } else {
        trj_name = trj_name += '.sh';
    }

    $.post('./php/commands.php', {
        cmd: 'trj_upgrade',
        trj_name: trj_name
    },
        function (data) {
            if (data == 0) {
                term.echo("[[b;red;]ERROR UPGRADING TROJAN]");
            } else {
                data = JSON.parse(data);
                socket.emit('get:problem', {
                    trj_lvl: data[0].trj_lvl
                });
            }
        });
}

function upgradeTrojanlvl(term) {
    $.post('./php/commands.php', {
        cmd: 'trj_upgrade_lvl',
    },
        function (data) {
            if (data == 0) {
                term.echo("[[b;red;]ERROR UPGRADING TROJAN]");
            } else {
                data = JSON.parse(data);
                createProgresslvl(term, 30, 100, "[[b;green;]trojan upgrade success]", data);
            }
        });
}

function hasWhiteSpace(s) {
    if (/\s/g.test(s)) {
        s = s.split(" ");
        var stringArray = new Array();
        for (var i = 0; i < s.length; i++) {
            stringArray.push(s[i]);
        }
        return stringArray;
    } else {
        return false;
    }
}
