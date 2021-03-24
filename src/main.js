import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// This url may need to change depending on what port your backend is running
// on.
/* const api = new API('http://localhost:5000');

console.log('hello');


// Example usage of makeAPIRequest method.
api.makeAPIRequest('dummy/user')
    .then(r => console.log(r));
    console.log('hello');
 */



function adderror (text) {
    
    const curDiv = document.getElementById('error_out');


    const newContent = document.createElement('div');
    newContent.innerText = text;
    newContent.className = 'error-box';

    curDiv.appendChild(newContent);
    curDiv.style.display = "";


    var button = document.createElement('input');
    button.type = 'button';
    button.value = 'Close';
    button.style.right = 0;
    curDiv.appendChild(button); 
    button.onclick = function () {                       
        curDiv.removeChild(newContent);
        curDiv.removeChild(button);
        curDiv.style.display = "none";
    };
}
const find_who_like = (id_list )=>{
    var name_array = [];
    var i;
    var name_string = '';
    for (i = 0; i < id_list.length; i++) {
        const result = fetch(`http://localhost:5000/user?id=${id_list[i]}`,{
            method:'GET',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + document.getElementById('my_token').innerText,
            },
        })
        .then((data) => {
            console.log('Success:', data);
            if(data.status == 200){
                
                data.json().then(result=>{
                    
                    name_array.push(result.username);
                    name_string = name_string + result.username +' ';
                    

                });
            } else if (data.status == 403) {
                adderror('The token is incorrect');
            } 
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    var name_string = name_array.toString();
    console.log(name_string);
    console.log(name_array);


    return name_array;


}

document.getElementById('log_button').addEventListener('click', () => {
    if (document.getElementById('log_password').value != document.getElementById('log_password_confirm').value){
        adderror('please make sure twice passwords are same!');
      
    } else {
        const loginPeople = {
            'username': document.getElementById('log_username').value,
            'password': document.getElementById('log_password').value,
            
        };
        const result = fetch('http://localhost:5000/auth/login',{
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginPeople),
        })
        .then((data) => {
            console.log('Success:', data);
            if(data.status == 200){
                
                data.json().then(result=>{
                    document.getElementById('my_token').innerText = result.token;
                    document.getElementById('dashboardscreen').style.display = '';
                    document.getElementById('loginscreen').style.display = 'none';
                    loadfeed();
                });

            } else if (data.status == 403) {
                adderror('username or password incorrect');

            
            } else if (data.status == 400) {
                adderror('please enter username and password');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
});

document.getElementById('regist_button').addEventListener('click', () => {
    let login_Screen = document.getElementById('loginscreen');
    login_Screen.style.display = 'None';
    let regist_Screen = document.getElementById('registscreen');
    regist_Screen.style.display = '';

})

document.getElementById('regist_submit').addEventListener('click', () => {
    if (document.getElementById('regist_password').value != document.getElementById('regist_password_confirm').value){

        adderror('please make sure twice passwords are same!');
      
    } else {
        const registPeople = {
            'username': document.getElementById('regist_username').value,
            'password': document.getElementById('regist_password').value,
            "email": document.getElementById('regist_email').value,
            "name": document.getElementById('regist_name').value,
        
        };
        const result = fetch('http://localhost:5000/auth/signup',{
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registPeople),
        })
        .then((data) => {
            console.log('Success:', data);
            if(data.status == 200){
                
                data.json().then(result=>{
                    document.getElementById('my_token').innerText = result.token;
                    document.getElementById('dashboardscreen').style.display = '';
                    document.getElementById('registscreen').style.display = 'none';
                    loadfeed();
                });
            } else if (data.status == 409) {
                adderror('The username has been used, please change the other one.');
            } else if (data.status == 400) {
                adderror('please enter username and password');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    
});

const loadfeed = () =>{
    const result = fetch('http://localhost:5000/user/feed?p=0&n=10',{
        method:'GET',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + document.getElementById('my_token').innerText,
        },

    })
    .then((data) => {
        console.log('Success:', data);
        if(data.status == 200){
            data.json().then(data=>{
                const posts = data.posts;
                posts.map(post=>{
                    // for each post detail;
                    const posteach = document.createElement('div');
                    posteach.className = 'post-box';
                    posteach.style.padding = '10px';
                    posteach.style.margin = '10px';
                    posteach.style.width = '80%';


                    posteach.style.backgroundColor = 'white';
                    posteach.style.border = '1px solid #333';

                    //grab the author
                    const feed_author = document.createElement('div');
                    feed_author.innerText= `By ${post.meta.author}`;
                    posteach.appendChild(feed_author);
                    //time
                    const feed_time = document.createElement('div');
                    //var timestamp3 = new Date(post.meta.published);
                    var timestamp3 =new Date(parseInt(post.meta.published)*1000+ 8 * 3600 * 1000).toJSON().substr(0, 19).replace('T', ' ' );
                    
                    feed_time.innerText= `Date: ${timestamp3}`;
                    posteach.appendChild(feed_time);

                    //grab the text
                    const feed_text = document.createElement('div');
                    feed_text.innerText= post.meta.description_text;
                    posteach.appendChild(feed_text);
                    
                    //image
                    const feed_imag = document.createElement('img');
                    feed_imag.setAttribute('src',`data:image/jpeg;base64,${post.thumbnail}`);
                    
                    posteach.appendChild(feed_imag);
                    document.getElementById('posts_list').appendChild(posteach);
                    

                    // set the comment part and like part
                    const intersect_part = document.createElement('div');
                    const like_part = document.createElement('div');
                    
                    const commet_part = document.createElement('div');
                    intersect_part.appendChild(commet_part);
                    intersect_part.appendChild(like_part);
                    
                    posteach.appendChild(intersect_part);

                    /////////////////////////////
                    //      like parts
                    ////////////////////////////
                    // set like buttom and number of likes calculate
                    var like_button = document.createElement('input');
                    like_button.type = 'button';
                    like_button.value = 'Like';
                    like_part.appendChild(like_button); 
                    const N_like = (post.meta.likes).length;
                    const feed_like = document.createTextNode(N_like);
                    like_part.appendChild(feed_like);
                    intersect_part.appendChild(like_part);


                    // load who like this comment 
                    var who_like_button = document.createElement('input');
                    who_like_button.type = 'button';
                    who_like_button.value = 'Show who Like';
                    like_part.appendChild(who_like_button);
                    const wholike = document.createElement('div');
                    like_part.appendChild(wholike);
                    wholike.style.display = 'none';

                    // load who like this comment 
                    const id_list = post.meta.likes;
                    var i;
                    for (i = 0; i < id_list.length; i++) {
                        const result = fetch(`http://localhost:5000/user?id=${id_list[i]}`,{
                            method:'GET',
                            headers:{
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + document.getElementById('my_token').innerText,
                            },
                        })
                        .then((data) => {
                            console.log('Success:', data);
                            if(data.status == 200){
                                
                                data.json().then(result=>{
                                    wholike.appendChild(document.createTextNode(result.username+ '👍'));

                                    if (result.username == document.getElementById('log_username').value 
                                    ||result.username == document.getElementById('regist_username').value
                                    ){
                                        like_button.value = 'Unlike';
                                    }
                                });
                            } else if (data.status == 403) {
                                adderror('The token is incorrect');
                            } 
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    };   
                    
                    
                    
                    // set like buttom and who like buttom rules
                    like_button.onclick = function () {
                        if (like_button.value == 'Unlike'){
                            const result = fetch(`http://localhost:5000/post/unlike?id=${post.id}`,{

                            method:'PUT',
                            headers:{
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + document.getElementById('my_token').innerText,
                            },
                        })
                        .then((data) => {
                            if(data.status == 200){
                                console.log('Success:', data);
                                like_button.value = 'like';
                            } 
                        });


                        } else {
                            
                            const result = fetch(`http://localhost:5000/post/like?id=${post.id}`,{

                                method:'PUT',
                                headers:{
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Token ' + document.getElementById('my_token').innerText,
                                },
                            })
                            .then((data) => {
                                if(data.status == 200){
                                    console.log('Success:', data);
                                    like_button.value = 'Unlike';
                                } 
                            });

                        }

                        
                        
                    };
                    who_like_button.onclick = function () {
                        if (who_like_button.value == 'Show who Like') {
                            wholike.style.display = '';
                            who_like_button.value = 'Unshow who Like';

                        } else {
                            wholike.style.display = 'none';
                            who_like_button.value = 'Show who Like';
                        }
                        
                        
                                   
                        
                    };
                    /////////////////////////////
                    //      comments parts
                    ////////////////////////////


                    //showing all the comments
                    // style set
                    var comment_button = document.createElement('input');
                    comment_button.type = 'button';
                    comment_button.value = 'Comment';
                    const N_comment = (post.comments).length;
                    const feed_comment = document.createTextNode('there is/are '+N_comment+' comment(s) in total.\n');
                    commet_part.appendChild(feed_comment);
                    commet_part.style.color = 'grey';
                    commet_part.style.fontSize = '10px';
                    commet_part.style.border = '1px solid #333';

                    // comment content
                    var i;
                    for (i = 0; i < post.comments.length; i++) {
                        const comment_used = document.createElement('div');
                        comment_used.style.color = 'grey';
                        comment_used.style.fontSize = '10px';

                        const auth = post.comments[i.toString()].author
                        var timestamp3 =new Date(parseInt(post.comments[i.toString()].published)*1000+ 8 * 3600 * 1000).toJSON().substr(0, 19).replace('T', ' ' );
                        comment_used.innerText =  ` ${timestamp3}   ${auth}  : ${post.comments[i.toString()].comment}` ;
                        commet_part.appendChild(comment_used);
                    }

                    commet_part.appendChild(comment_button); 
                    comment_button.onclick = function () {                       
                        
                    };
                    


                });
                console.log(posts);
           });
        } else if (data.status == 403) {
            adderror('The token is incorrect');
        } 
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    
};