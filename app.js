(function(){var $=U.$,h=U.h;
var CATS=['Food','Transport','Housing','Bills','Health','Shopping','Fun','Other'];
var data=U.load('exp.items',[]),bud=U.load('exp.budgets',{});
$('date').value=U.today();$('month').value=U.today().slice(0,7);
CATS.forEach(function(c){$('cat').appendChild(h('option',{value:c,text:c}))});
function save(){U.save('exp.items',data);U.save('exp.budgets',bud)}
function num(s){s=String(s).trim().replace(/,/g,'');return /^\d+(\.\d{1,2})?$/.test(s)?parseFloat(s):NaN}
function month(){return $('month').value||U.today().slice(0,7)}
function render(){
 var m=month(),items=data.filter(function(x){return x.date.slice(0,7)===m}).sort(function(a,b){return a.date<b.date?1:-1});
 var by={};CATS.forEach(function(c){by[c]=0});items.forEach(function(x){by[x.cat]=(by[x.cat]||0)+x.amount});
 var total=items.reduce(function(s,x){return s+x.amount},0);$('tot').textContent='Total '+U.money(total);
 var tb=$('rows');tb.textContent='';
 items.forEach(function(x){var tr=h('tr',{},[h('td',{text:x.date}),h('td',{text:x.cat}),h('td',{text:x.note}),h('td',{class:'n',text:U.money(x.amount)}),h('td',{},[h('button',{class:'x','data-id':x.id,'aria-label':'Delete expense',text:'Delete'})])]);tb.appendChild(tr)});
 $('empty').hidden=items.length>0;
 var sm=$('sum');sm.textContent='';var bd=$('budgets');bd.textContent='';
 Object.keys(by).forEach(function(c){
  var b=+bud[c]||0,v=by[c];var over=b>0&&v>b;var pct=b>0?Math.min(100,v/b*100):(total>0?v/total*100:0);
  var bar=h('div',{class:'bar'+(over?' over':''),role:'img','aria-label':c+' '+Math.round(pct)+'%'},[h('i',{style:'width:'+pct+'%'})]);
  sm.appendChild(h('div',{style:'margin-bottom:.7rem'},[h('div',{style:'display:flex;justify-content:space-between'},[h('span',{text:c}),h('span',{class:over?'err':'mut','data-cat':c,text:U.money(v)+(b>0?' / '+U.money(b)+(over?' OVER':''):'')})]),bar]));
  var inp=h('input',{type:'text',inputmode:'decimal','data-bud':c,value:b?String(b):'',placeholder:'0'});
  bd.appendChild(h('label',{},[document.createTextNode(c+' budget'),inp]));
 });
}
$('f').addEventListener('submit',function(e){e.preventDefault();var er=$('err');
 var a=num($('amount').value),d=$('date').value;
 if(!d){er.textContent='Pick a date.';er.hidden=false;return}
 if(!(a>0)){er.textContent='Enter an amount greater than 0 (up to 2 decimals).';er.hidden=false;$('amount').focus();return}
 er.hidden=true;data.push({id:Date.now()+Math.random().toString(16).slice(2,6),date:d,cat:$('cat').value,note:$('note').value.trim().slice(0,80),amount:a});save();$('amount').value='';$('note').value='';
 if(d.slice(0,7)!==month())$('month').value=d.slice(0,7);render()});
$('rows').addEventListener('click',function(e){var id=e.target.getAttribute&&e.target.getAttribute('data-id');if(!id)return;data=data.filter(function(x){return x.id!==id});save();render()});
$('budgets').addEventListener('input',function(e){var c=e.target.getAttribute('data-bud');if(!c)return;var v=num(e.target.value);if(e.target.value.trim()===''){delete bud[c]}else if(v>=0)bud[c]=v;save();
 renderSummaryOnly()});
function renderSummaryOnly(){var a=document.activeElement,c=a&&a.getAttribute('data-bud');var pos=a&&a.selectionStart;render();if(c){var n=document.querySelector('[data-bud="'+c+'"]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}}
$('month').addEventListener('input',render);
$('exp').addEventListener('click',function(){var rows=[['date','category','note','amount']].concat(data.slice().sort(function(a,b){return a.date<b.date?-1:1}).map(function(x){return [x.date,x.cat,x.note,x.amount.toFixed(2)]}));U.download('expenses.csv',U.toCSV(rows))});
$('imp').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var rows=U.parseCSV(r.result);if(!rows.length||rows[0].join(',').toLowerCase().indexOf('date')<0){$('msg').className='err';$('msg').textContent='Not an expense CSV (needs date,category,note,amount).';$('msg').hidden=false;return}
 var n=0,bad=0;rows.slice(1).forEach(function(r){if(r.length<4)return;var a=num(r[3]),d=r[0];var cat=CATS.indexOf(r[1])>=0?r[1]:'Other';if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!(a>0)){bad++;return}
  var dup=data.some(function(x){return x.date===d&&x.cat===cat&&x.note===r[2]&&x.amount===a});if(dup)return;data.push({id:Date.now()+Math.random().toString(16).slice(2,6),date:d,cat:cat,note:String(r[2]).replace(/^'/,'').slice(0,80),amount:a});n++});
 save();render();$('msg').className='ok';$('msg').textContent='Imported '+n+' rows'+(bad?', skipped '+bad+' invalid':'')+'. Duplicates ignored.';$('msg').hidden=false};r.readAsText(f);e.target.value=''});
render();
})();
