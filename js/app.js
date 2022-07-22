const accNum = document.querySelector('.accNum');
const acc =document.querySelector('.acc');

const acc1 = document.querySelector('.acc1');
acc1.addEventListener('click', (e) => {
    acc.innerHTML = acc1.innerHTML
})

const acc2 = document.querySelector('.acc2');
acc2.addEventListener('click', (e) => {
    acc.innerHTML = acc2.innerHTML
})

const acc3 = document.querySelector('.acc3');
acc3.addEventListener('click', (e) => {
    acc.innerHTML = acc3.innerHTML
})

const curl = acc.innerHTML;


//Salutation
if((new Date().getHours()) < 24){
    document.querySelector('.hello').innerHTML="Evening";
}
if(new Date().getHours() < 17){
    document.querySelector('.hello').innerHTML="Afternoon";
}
if(new Date().getHours() < 12){
    document.querySelector('.hello').innerHTML="Morning";
}


//Show no data
function zeroData() {
    let amountNodes = document.querySelectorAll('.amt');
        for (let i = 0; i < amountNodes.length; i++) {
            amountNodes[i].innerHTML = 0;
            }
        document.querySelector(".piechart").innerHTML="";
        document.querySelector('.percIndicator').innerHTML="";
        document.querySelector('.expense_status').classList='';
}



//Function to fetch json data
async function getTransactions() {
    let url = 'http://127.0.0.1:5000/api/transactions/'+curl; //static/test.json
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
            console.log(error);
            zeroData();
            document.querySelector('.table').innerHTML = "Sorry, account not found";
    }
}

//Funtion to add 0 infront of a single digit
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

//Funtion to format a date to YYYY-MM-DD
function formatDate(date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-');
}

//Function to get current month + year
function getMonthYear(date) {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1)
    ].join('-');
  }
//save the current month to a variable
let currentMonth = getMonthYear(new Date());

//Function to get previous month + year
function getPrevious(date) {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth())
    ].join('-');
  }
//save the last month to a variable
let lastMonth = getPrevious(new Date());

//Function to get number of days in a month
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }


//Function to render data on HTML
async function renderTransactions() {
    let transactions = await (getTransactions());
    let tbody = '';
    let currentAmount = [1];
    let previousAmount = [1];

    console.log(transactions.length+1)


    if (transactions.length == 0) {
        zeroData();
        document.querySelector('.table').innerHTML = "No transactions recorded.";


    } else { 
        let hidden = document.querySelectorAll('.hidden');
        for (let i = 0; i < hidden.length; i++) {
            hidden[i].classList.remove("hidden");
            }
    transactions.forEach(transaction => {
        
        //render to table without time (a row is added with each loop)
        const formatedDate = formatDate(new Date(transaction.date));
        let tr =   `<tr>
                    <td data-column="Date">${formatedDate}</td>
                    <td data-column="Type">${transaction.type}</td>
                    <td data-column="Merchant">${transaction.merchantName}</td>
                    <td data-column="Amount">Ksh. ${parseInt(transaction.amount).toLocaleString("en-US")}</td>
                    </tr>`
        tbody += tr;

        //get transaction months
        const monthYear = getMonthYear(new Date(transaction.date))
        //add current months expenses to an array
        if(monthYear === currentMonth){
            currentAmount.push(transaction.amount);
            
        }
        if(monthYear === lastMonth){
            previousAmount.push(transaction.amount);
        }

    });
}

    
    //use the reduce() method to sum an array - find totals
    const reducer = (accumulator, curr) => accumulator + curr;
    const totalCurrent = currentAmount.reduce(reducer)-1;
    const totalPrevious = previousAmount.reduce(reducer)-1;
    console.log(totalCurrent);
    console.log(totalPrevious);

    
    //html render table
    document.querySelector('.transaction_data').innerHTML = tbody;

    //html render current expenses
    document.querySelector('.curExp').innerHTML = "Ksh. "+totalCurrent.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var days = new Date().getDate();
    document.querySelector('.curDaily').innerHTML = "Ksh. "+(totalCurrent/days).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let change = totalCurrent-totalPrevious;
    let percentChange = (change/totalPrevious)*100;
    let perc = document.querySelector('#current_percentage');
    perc.innerHTML = percentChange.toFixed(2)+"%";
    
    let percIcon = document.querySelector('.card_percentage-icon');
    if(change<0){
        percIcon.classList.add("uil-angle-down"); 
        percIcon.style="color: #36d80e";
        perc.style="color: #36d80e";
    } 
    if (change==0){
        percIcon.classList = "";
    }
    if (change>0) {
        percIcon.classList.add("uil-angle-up");
        percIcon.style="color: #fa4632be";
        perc.style="color: #ff3f2a";
    }

    //html render previous expenses
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth();
    const daysPrevMonth = getDaysInMonth(currentYear, month);
    document.querySelector('.prevExp').innerHTML = "Ksh. "+totalPrevious.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.querySelector('.prevDaily').innerHTML = "Ksh. "+(totalPrevious/daysPrevMonth).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    //html render budget vs expenses
    const budget = parseFloat((document.querySelector('.budget').innerHTML).replace(/,/g, ''))
    const remainingAmt = document.querySelector('.remainingAmt');
    const pie_percentage = document.querySelector('.pie_percentage');
    const remaining = (budget - totalCurrent).toFixed(2);
    let words = document.querySelector('.remaining');
    const percPie = Math.round((totalCurrent/budget)*100);

    if (remaining > 0) {
        remainingAmt.innerHTML ="Ksh. "+remaining.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        pie_percentage.innerHTML = "Spent "+percPie+"%";
        document.querySelector('.pie').style="--p:"+percPie+""
    }
    if (remaining < 0) {
        words.innerHTML = "Surparsed Expenses:";
        words.style = "color: #ff3f2a";
        remainingAmt.innerHTML = "Ksh. "+(totalCurrent - budget).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        remainingAmt.style = "color: #ff3f2a"; 
        const surpased = percPie-100;
        pie_percentage.innerHTML = "over "+(surpased)+"%";  
        document.querySelector('.pie').style="--p:"+surpased+"";
        document.querySelector('.pie').classList="pie2 animate";
        pie_percentage.style="color:#ff3f2a;"
    }

    //status notification
    if (percPie > 80){
        document.querySelector('.expense_status').classList.add("danger");
        document.querySelector('.expense_status').title="Status: Danger-Zone";
        document.querySelector('.ball'). classList.add("danger");
    }
    if (percPie > 50){
        document.querySelector('.expense_status'). classList.add("warning");
        document.querySelector('.expense_status').title="Status: Warning";
        document.querySelector('.ball'). classList.add("warning");
    }
    else if (percPie <= 50){
        document.querySelector('.expense_status').classList.add("okay");
        document.querySelector('.expense_status').title="Status: Okay";
        document.querySelector('.ball').classList.add("okay");
    }

    console.log (  percPie  ); 


}

renderTransactions();


