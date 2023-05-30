class CalcController {

  constructor() {
       // Inicialização de variáveis e atributos
       this._audio = new Audio('click.mp3'); // Reproduz um som ao pressionar os botões
       this._audioOnOff = false; // Controla se o som está ligado ou desligado
       this._lastOperator = ''; // Armazena o último operador utilizado
       this._lastNumber = ''; // Armazena o último número utilizado
   

       this._operation = []; // Armazena as operações realizadas
       this._locale = 'pt-BR'; // Define o local (idioma) da calculadora
       this._displayCalcEl = document.querySelector("#display"); // Seleciona o elemento de exibição do resultado da calculadora
       this._dateEl = document.querySelector("#data"); // Seleciona o elemento de exibição da data
       this._timeEl = document.querySelector("#hora"); // Seleciona o elemento de exibição do horário

       this._currentDate; // Armazena a data atual

       this.initialize(); // Inicializa a calculadora
       this.initButtonsEvents(); // Inicializa os eventos dos botões
       this.initKeyboard(); // Inicializa os eventos do teclado
     }
   

     copyToClipboard() {
        // Copia o valor exibido no display da calculadora para a área de transferência
        if (navigator.clipboard) {
          navigator.clipboard.writeText(this.displayCalc);
        }
      }

      pasteFromClipboard() {
        // Obtém o valor da área de transferência e o converte para um número para exibir no display
        document.addEventListener('paste', e => {
          let text = e.clipboardData.getData('Text');
          this.displayCalc = parseFloat(text);
        });
      }

      initialize() {
        // Inicializa a exibição da data e do horário
        this.setDisplayDateTime();
    
        // Atualiza a exibição da data e do horário a cada segundo
        setInterval(() => {
          this.setDisplayDateTime();
        }, 1000);
    
        this.setLastNumberToDisplay(); // Exibe o último número no display
        this.pasteFromClipboard(); // Obtém o valor da área de transferência
    
        // Adiciona o evento de duplo clique nos botões de limpar (AC) para ativar/desativar o som da calculadora
        document.querySelectorAll('.btn-ac').forEach(btn => {
          btn.addEventListener('dblclick', e => {
            this.toggleAudio();
          });
        });
      }

      toggleAudio() {
        // Alterna o estado do som (ligado/desligado)
        this._audioOnOff = !this._audioOnOff;
      }
    

      playAudio() {
        // Reproduz o som da calculadora, se o som estiver ligado
        if (this._audioOnOff) {
          this._audio.currentTime = 0;
          this._audio.play();
        }
      }

      initKeyboard() {
        // Inicializa os eventos do teclado
        document.addEventListener('keyup', e => {
          this.playAudio(); // Reproduz o som ao pressionar uma tecla
    
          switch (e.key) {
            case 'Escape':
              this.clearAll(); // Limpa todos os valores e operações
              break;
            case 'Backspace':
              this.clearEntry(); // Limpa o último valor ou operação
              break;
            case '+':
            case '-':
            case '*':
            case '%':
            case '/':
              this.addOperation(e.key); // Adiciona o operador pressionado
              break;
            case 'Enter':
            case '=':
              this.calc(); // Realiza o cálculo
              break;
            case '.':
            case ',':
              this.addDot(); // Adiciona o ponto decimal
              break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
              this.addOperation(parseInt(e.key)); // Adiciona o número pressionado
              break;
            case 'c':
              if (e.ctrlKey) this.copyToClipboard(); // Copia o valor para a área de transferência (Ctrl+C)
              break;
          }
        });
      }
    

      addEventListenerAll(element, events, fn) {
        // Adiciona um ouvinte de eventos a um elemento HTML
        events.split(' ').forEach(event => {
          element.addEventListener(event, fn, false);
        });
      }

      clearAll() {
        // Limpa todas as operações e valores
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
      }

      clearEntry() {
        // Remove a última operação
        this._operation.pop();
        this.setLastNumberToDisplay();
      }

      getLastOperation() {
        // Obtém a última operação realizada
        return this._operation[this._operation.length - 1];
      }

      setLastOperation(value) {
        // Define o valor da última operação
        this._operation[this._operation.length - 1] = value;
      }
    
      isOperator(value) {
        // Verifica se o valor é um operador
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
      }

      pushOperation(value) {
        // Adiciona a operação ao array e realiza o cálculo, se houver mais de 3 elementos no array
        this._operation.push(value);
        if (this._operation.length > 3) {
          this.calc();
        }
      }

      getResult() {
        // Obtém o resultado da operação
        try {
          const result = eval(this._operation.join(""));
          return result;
        } catch (e) {
          setTimeout(() => this.setError(), 1);
          return undefined; // ou outro valor de erro, se necessário
        }
      }

      calc() {
        // Realiza o cálculo
        let last = '';
        this._lastOperator = this.getLastItem();
    
        if (this._operation.length < 3) {
          // Se houver menos de 3 elementos no array, repete o último número e o operador
          let firstItem = this._operation[0];
          this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }
    
        if (this._operation.length > 3) {
          last = this._operation.pop();
          this._lastNumber = this.getResult();
        } else if (this._operation.length === 3) {
          this._lastNumber = this.getLastItem(false);
        }
    
        let result = this.getResult();
    
        if (last == '%') {
          // Caso o último item seja o operador de porcentagem, divide o resultado por 100
          result /= 100;
          this._operation = [result];
        } else {
          this._operation = [result.toFixed(2)];
    
          if (last) this._operation.push(last);
        }
    
        this.setLastNumberToDisplay();
      }

      getLastItem(isOperator = true) {
        // Obtém o último item (número ou operador) do array de operações
        let lastItem;
    
        for (let i = this._operation.length - 1; i >= 0; i--) {
          if (this.isOperator(this._operation[i]) === isOperator) {
            lastItem = this._operation[i];
            break;
          }
        }
    
        if (!lastItem) {
          lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }
    
        return lastItem;
      }

      setLastNumberToDisplay() {
        // Atualiza o display com o último número da operação
        let lastNumber = this.getLastItem(false);
        if (!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
      }


      addOperation(value) {
        // Adiciona uma operação ao array de operações
        if (isNaN(this.getLastOperation())) {
        if (this.isOperator(value)) {
            this.setLastOperation(value);
        } else {
            this.pushOperation(value);
            this.setLastNumberToDisplay();
        }
        } else {
        if (this.isOperator(value)) {
            this.pushOperation(value);
        } else {
            let newValue = this.getLastOperation().toString() + value.toString();
            this.setLastOperation(newValue);
            this.setLastNumberToDisplay();
        }
        }
      }


      setError() {
        // Exibe a mensagem de erro no display
        this.displayCalc = "Error";
      }

      addDot() {
        // Adiciona o ponto decimal ao número
        let lastOperation = this.getLastOperation();
    
        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;
    
        if (this.isOperator(lastOperation) || !lastOperation) {
          this.setLastOperation('0.');
        } else {
          this.setLastOperation(lastOperation.toString() + '.');
        }
    
        this.setLastNumberToDisplay();
      }

      execBtn(value) {
        // Executa a ação correspondente ao botão pressionado
        this.playAudio();
    
        switch (value) {
          case 'ac':
            this.clearAll();
            break;
          case 'ce':
            this.clearEntry();
            break;
          case 'soma':
            this.addOperation('+');
            break;
          case 'subtracao':
            this.addOperation('-');
            break;
          case 'multiplicacao':
            this.addOperation('*');
            break;
          case 'porcento':
            this.addOperation('%');
            break;
          case 'divisao':
            this.addOperation('/');
            break;
          case 'igual':
            this.calc();
            break;
          case 'ponto':
            this.addDot();
            break;
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            this.addOperation(parseInt(value));
            break;
          default:
            this.setError();
        }
      }
    

      initButtonsEvents() {
        // Inicializa os eventos de clique nos botões da calculadora
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
    
        buttons.forEach((btn, index) => {
          this.addEventListenerAll(btn, 'click drag', e => {
            let textBtn = btn.className.baseVal.replace("btn-", "");
            this.execBtn(textBtn);
          });
    
          this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
            btn.style.cursor = "pointer";
          });
        });
      }

      setDisplayDateTime() {
      // Define a data e hora atual no display da calculadora
      this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
          day: "2-digit",
          month: "long",
          year: "numeric"
      });
      this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

      }

        get displayTime() {
            // Obtém o horário exibido na calculadora
            return this._timeEl.innerHTML;
        }

        set displayTime(value) {
            this._timeEl.innerHTML = value;
        }

        get displayDate() {
            // Obtém a data exibida na calculadora
            return this._dateEl.innerHTML;
        }

        set displayDate(value) {
            // Define a data a ser exibida na calculadora
            this._dateEl.innerHTML = value;
        }

        get displayCalc() {
            // Obtém o valor exibido no display da calculadora

            return this._displayCalcEl.innerHTML;

        }

        set displayCalc(value) {
        // Define o valor a ser exibido no display da calculadora
            if (value.toString().length > 10) {
                this.setError();
                return false;
            }

            this._displayCalcEl.innerHTML = value;
            
        }

        get currentDate() {
            // Obtém a data atual
            return new Date();
        }

        set currentDate(value) {
            // Define o horário a ser exibido na calculadora
            this._currentDate = value;
        }

        }
        //window.calculator = new CalcController();