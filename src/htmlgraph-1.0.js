var lisp_Symbol = "Symbol";
var lisp_Number = "Number";
var lisp_List = "List";
var lisp_Proc = "Proc";
var lisp_Lambda = "Lambda";

var lisp_COMMON_LISP = "common_lisp";
var lisp_SCHEME = "scheme";
var lisp_dialect = lisp_SCHEME;
//var lisp_dialect = lisp_COMMON_LISP;

function lisp_cell()
{
    if(arguments.length > 1) {
        // new lisp_cell(type, val)
        this.type = arguments[0];
        this.val = arguments[1];
    }
    else if(arguments.length > 0 && typeof arguments[0] === "function") {
        // new lisp_cell(proc)
        this.type = lisp_Proc;
        this.val = "";
        this.proc = arguments[0];
    }
    else {
        // new lisp_cell(type)
        this.type = arguments[0] || lisp_Symbol;
        this.val = "";
    }

    // std::vector<lisp_cell> list;
    this.list = [];
}

/**
 * Evaluates this cell using the given environment.
 */
lisp_cell.prototype.eval = function(env) {
    // Symbols represent lookups.
    if(this.type == lisp_Symbol) {
        return env.findVar(this.val).getVar(this.val);
    }

    // Literals represent themselves.
    if(this.type == lisp_Number) {
        return this;
    }

    if(this.list.length === 0) {
        return lisp_nil;
    }

    if(this.list[0].type == lisp_Symbol) {
        // (quote exp)
        if(this.list[0].val == "quote") {
            return this.list[1];
        }

        // (if test conseq [alt])
        if(this.list[0].val == "if") {
            if(this.list[1].eval(env) === lisp_false_sym) {
                if(this.list.length < 4) {
                    return lisp_nil;
                }
                return this.list[3].eval(env);
            }
            return this.list[2].eval(env);
        }

        if(lisp_dialect === lisp_SCHEME) {
            // (set! var exp)
            if(this.list[0].val === "set!") {
                var localEnv = env.findVar(this.list[1].val);
                var result = this.list[2].eval(env);
                localEnv.setVar(this.list[1].val, result);
                return result;
            }

            // (define var exp)
            if(this.list[0].val === "define") {
                var result = this.list[2].eval(env);
                //console.log("Defining: " + this.list[1].val);
                env.setVar(this.list[1].val, result);
                return result;
            }

            // (begin exp*)
            if(this.list[0].val == "begin") {
                for(var i = 1; i < this.list.length - 1; ++i) {
                    this.list[i].eval(env);
                }
                return this.list[this.list.length - 1].eval(env);
            }
        }
        else if(lisp_dialect === lisp_COMMON_LISP) {
            // (setq var exp)
            if(this.list[0].val === "setq") {
                var localEnv = env.findVar(this.list[1].val);
                localEnv.setVar(this.list[1].val, this.list[2].eval(env));
            }

            // (defvar var exp)
            if(this.list[0].val === "defvar") {
                if(!env.findVar(this.list[1].val)) {
                    // Variable was not found, so set it.
                    env.setVar(this.list[1].val, this.list[2].eval(env));
                }

                // Return the name of the defined variable.
                return this.list[1];
            }

            // (defun square (x)
            //   (* x x))
            if(this.list[0].val === "defun") {
                env.setProc(this.list[1].val,  this.list[2].eval(env));

                // Return the name of the defined procedure.
                return this.list[1];
            }

            // (progn exp*)
            if(this.list[0].val == "progn") {
                for(var i = 1; i < this.list.length - 1; ++i) {
                    this.list[i].eval(env);
                }
                return this.list[this.list.length - 1].eval(env);
            }
        }

        // (lambda (var*) exp)
        if(this.list[0].val == "lambda") {
            this.type = lisp_Lambda;
            // keep a reference to the environment that exists now (when the
            // lambda is being defined) because that's the outer environment
            // we'll need to use when the lambda is executed
            this.env = env;
            return this;
        }
    }

    // (proc exp*)
    var proc = env.findProc(this.list[0].val).getProc(this.list[0].val);
    if(!proc) {
        throw new Error("Proc must not be null");
    }
    var exps = [];

    for(var i = 1; i < this.list.length; ++i) {
        exps.push(this.list[i].eval(env));
    }
    if(proc.type == lisp_Lambda) {
        // Create an environment for the execution of this lambda function
        // where the outer environment is the one that existed* at the time
        // the lambda was defined and the new inner associations are the
        // parameter names with the given arguments.
        // *Although the environment existed at the time the lambda was defined
        // it wasn't necessarily complete - it may have subsequently had
        // more symbols defined in that environment.
        return proc.list[2].eval(new lisp_environment(
            proc.list[1].list, exps, proc.env
        ));
    }
    if(proc.type == lisp_Proc) {
        return proc.proc.apply(proc, exps);
    }

    throw new Error("not a function\n");
}

/**
 * Converts the given cell to a Lisp-readable string.
 */
lisp_cell.prototype.toString = function() {
    if(this.type === lisp_List) {
        var children = [];
        for(var i = 0; i < this.list.length; ++i) {
            children.push(this.list[i].toString());
        }
        return '(' + children.join(" ") + ')';
    }
    if(this.type == lisp_Lambda) {
        return "<Lambda>";
    }
    if(this.type == lisp_Proc) {
        return "<Proc>";
    }
    return this.val;
}

function lisp_environment()
{
    this.procedures_ = {};
    this.variables_ = {};

    if(arguments.length > 1) {
        // new lisp_environment(parms, args, outer)
        var parms = arguments[0];
        var args = arguments[1];
        // const lisp_cells& args
        for(var i = 0; i < parms.length; ++i) {
            var p = parms[i];
            this.variables_[p.val] = args[i];
        }
        this.outer_ = arguments[2];
    }
    else {
        // new lisp_environment(outer)
        this.outer_ = arguments[0];
    }
}

lisp_environment.prototype.variables = function()
{
    return this.variables_;
};

lisp_environment.prototype.procedures = function()
{
    return this.procedures_;
};

lisp_environment.prototype.outerEnv = function()
{
    return this.outer_;
};

lisp_environment.prototype.setVar = function(name, value)
{
    this.variables_[name] = value;
};

lisp_environment.prototype.setProc = function(name, proc)
{
    if(lisp_dialect === lisp_SCHEME) {
        return this.setVar(name, proc);
    }
    this.procedures_[name] = value;
};


/**
 * return a reference to the innermost environment where 'var' appears
 */
lisp_environment.prototype.findVar = function(varName)
{
    // check if the symbol exists in this environment
    if(varName in this.variables_) {
        return this;
    }

    // attempt to find the symbol in some "outer" env
    if(this.outer_) {
        //console.log("Deferring to outer environment for variable");
        return this.outer_.findVar(varName);
    }

    throw new Error("unbound symbol '" + varName + "'");
};

lisp_environment.prototype.getVar = function(varName)
{
    return this.variables_[varName];
};

lisp_environment.prototype.getProc = function(procName)
{
    if(lisp_dialect === lisp_SCHEME) {
        //console.log("Deferring to var for procedure");
        return this.getVar(procName);
    }

    return this._procedures_[procName];
};

/**
 * return a reference to the innermost environment where 'var' appears
 */
lisp_environment.prototype.findProc = function(procName)
{
    if(lisp_dialect === lisp_SCHEME) {
        //console.log("Deferring to var for procedure");
        return this.findVar(procName);
    }

    // check if the procedure exists in this environment
    var proc = this.procedures_[procName];
    if(proc) {
        //console.log("Found procedure: " + proc);
        return this;
    }

    // attempt to find the procedure in some outer env
    if(this.outer_) {
        //console.log("Deferring to outer environment for procedure");
        return this.outer_.findProc(procName);
    }

    throw new Error("unbound procedure '" + procName);
};

var lisp_nil = new lisp_cell(lisp_Symbol, "nil");
var lisp_true_sym = new lisp_cell(lisp_Symbol, lisp_dialect === lisp_SCHEME ? "#t" : "T"); // anything that isn't false_sym is true
if(lisp_dialect === lisp_SCHEME) {
    lisp_false_sym = new lisp_cell(lisp_Symbol, "#f");
}
else {
    lisp_false_sym = lisp_nil;
}

// return given number as a string
{
    ////////////////////// built-in primitive procedures
    var proc_add = function() {
        var n = Number(arguments[0].val);
        for(var i = 1; i < arguments.length; ++i) {
            n += Number(arguments[i].val);
        }
        return new lisp_cell(lisp_Number, n);
    };

    var proc_sub = function() {
        var n = Number(arguments[0].val);
        for(var i = 1; i < arguments.length; ++i) {
            n -= Number(arguments[i].val);
        }
        return new lisp_cell(lisp_Number, n);
    };

    var proc_mul = function() {
        var n = 1;
        for(var i = 0; i < arguments.length; ++i) {
            n *= Number(arguments[i].val);
        }
        return new lisp_cell(lisp_Number, n);
    };

    var proc_div = function() {
        var n = Number(arguments[0].val);
        for(var i = 1; i < arguments.length; ++i) {
            n /= Number(arguments[i].val);
        }
        return new lisp_cell(lisp_Number, n);
    };

    var proc_greater = function() {
        var n = Number(arguments[0].val);
        for(var i = 1; i < arguments.length; ++i) {
            if(n <= Number(arguments[i].val)) {
                return lisp_false_sym;
            }
        }
        return lisp_true_sym;
    };

    var proc_greater_equal = function() {
        var n = Number(arguments[0].val);
        for(var i = 1; i < arguments.length; ++i) {
            if(n < Number(arguments[i].val)) {
                return lisp_false_sym;
            }
        }
        return lisp_true_sym;
    };

    var proc_less = function() {
        var n = Number(arguments[0].val);
        for(var i = 1; i < arguments.length; ++i) {
            if(n >= Number(arguments[i].val)) {
                return lisp_false_sym;
            }
        }
        return lisp_true_sym;
    };

    var proc_less_equal = function() {
        var n = Number(arguments[0].val);
        for(var i = 1; i < arguments.length; ++i) {
            if(n > Number(arguments[i].val)) {
                return lisp_false_sym;
            }
        }
        return lisp_true_sym;
    };

    var proc_length = function() {
        return new lisp_cell(lisp_Number, arguments[0].list.length);
    };

    var proc_nullp = function() {
        return arguments[0].list.length === 0 ? lisp_true_sym : lisp_false_sym;
    };

    var proc_car = function() {
        return arguments[0].list[0];
    };

    var proc_cdr = function() {
        if(arguments[0].list.length < 2) {
            return lisp_nil;
        }
        var result = new lisp_cell(arguments[0]);
        result.shift();
        return result;
    };

    var proc_append = function() {
        var result = new lisp_cell(lisp_List);
        result.list = arguments[0].list;
        arguments[1].forEach(function(i) {
            result.list.push(i);
        });
        return result;
    };

    var proc_cons = function() {
        var result = new lisp_cell(lisp_List);
        result.list.push(arguments[0]);
        arguments[1].forEach(function(i) {
            result.list.push(i);
        });
        return result;
    };

    var proc_list = function() {
        var result = new lisp_cell(lisp_List);
        result.list = [].slice.call(arguments);
        return result;
    };

    // define the bare minimum set of primintives necessary to pass the unit tests
    lisp_add_globals = function(env)
    {
        env.setVar("nil", lisp_nil);
        if(lisp_dialect === lisp_SCHEME) {
            env.setVar("#f", lisp_false_sym);
            env.setVar("#t", lisp_true_sym);
        }
        else if(lisp_dialect === lisp_COMMON_LISP) {
            env.setVar("T", lisp_true_sym);
        }

        env.setProc("append", new lisp_cell(proc_append));
        env.setProc("car", new lisp_cell(proc_car));
        env.setProc("cdr", new lisp_cell(proc_cdr));
        env.setProc("cons", new lisp_cell(proc_cons));
        env.setProc("length", new lisp_cell(proc_length));
        env.setProc("list", new lisp_cell(proc_list));
        if(lisp_dialect === lisp_SCHEME) {
            env.setProc("null?", new lisp_cell(proc_nullp));
        }
        else if(lisp_dialect === lisp_COMMON_LISP) {
            env.setProc("null", new lisp_cell(proc_nullp));
        }
        env.setProc("+", new lisp_cell(proc_add));
        env.setProc("-", new lisp_cell(proc_sub));
        env.setProc("*", new lisp_cell(proc_mul));
        env.setProc("/", new lisp_cell(proc_div));
        env.setProc(">", new lisp_cell(proc_greater));
        env.setProc("<", new lisp_cell(proc_less));
        env.setProc("<=", new lisp_cell(proc_less_equal));
        env.setProc(">=", new lisp_cell(proc_less_equal));
    };
}

/**
 * Convert given string to list of tokens.
 */
function lisp_tokenize(str)
{
    var tokens = [];
    str = str.toString();
    var i = 0;
    while(i < str.length) {
        var c = str.charAt(i);
        if(c === ';') {
            while(c !== '\n') {
                c = str.charAt(++i);
            }
            ++i;
            continue;
        }
        if(c === ' ') {
            ++i;
            continue;
        }
        if(c === '\n') {
            tokens.push(c);
            ++i;
            continue;
        }
        if(c === '(' || c === ')') {
            tokens.push(c);
            ++i;
            continue;
        }

        // A string.
        if(c === '"') {
            ++i;
            var start = i;
            var count = 0;
            c = str.charAt(i);
            while(c != '"') {
                ++count;
                ++i;
                c = str.charAt(i);
            }
            tokens.push(str.substring(start, start + count));
            ++i;
            continue;
        }

        // A symbol or procedure name.
        var start = i;
        var count = 0;
        while(i < str.length && (c !== ' ' && c !== '\n') && c !== '(' && c !== ')') {
            ++count;
            c = str.charAt(i++);
        }
        --count;
        --i;
        tokens.push(str.substring(start, start + count));
    }
    return tokens;
}

// return true iff given character is '0'..'9'
{
    var isdig = function(c) {
        c = c.toString();
        return !isNaN(c - parseFloat(c));
    };

    // numbers become Numbers; every other token is a Symbol
    lisp_atom = function(token)
    {
        //console.log("Making atom for " + token);
        if(isdig(token[0]) || (token[0] === '-' && (token.length > 1 && isdig(token[1])))) {
            return new lisp_cell(lisp_Number, token);
        }
        return new lisp_cell(lisp_Symbol, token);
    }
}

/**
 * Returns the Lisp expression in the given tokens.
 */
function lisp_read_from(tokens)
{
    var token = tokens.shift();
    if(token === "(") {
        var c = new lisp_cell(lisp_List);
        var newLined = false;
        while(tokens.length > 1 && tokens[0] !== ")") {
            if(tokens[0] === '\n') {
                tokens.shift();
                newLined = true;
                continue;
            }
            var child = lisp_read_from(tokens);
            if(newLined) {
                child.newLined = true;
                newLined = false;
            }
            c.list.push(child);
        }
        tokens.shift();
        return c;
    }
    else {
        return lisp_atom(token);
    }
}

/**
 * Return the Lisp expression represented by the given string.
 */
function lisp_read(s)
{
    return lisp_read_from(lisp_tokenize(s));
}

/*

void lisp_repl(const std::string & prompt, lisp_environment * env)
{
    // Begin the REPL
    for(;;) {
        std::cout << prompt;
        std::string line;
        if(!std::getline(std::cin, line)) {
            std::cout << '\n';
            break;
        }
        console.log(lisp_eval(lisp_read(line), env));
    }
}

int main()
{
    // Create the initial environment.
    lisp_environment global_env;
    lisp_add_globals(global_env);

    lisp_repl("90> ", &global_env);

    return 0;
}
*/

/* Generated Thu Mar  2 16:10:20 CST 2017 */
