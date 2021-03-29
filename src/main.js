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

let global_my_token = undefined;
let global_user_name = undefined;
let global_user_id = undefined;

////////////////////////////////
//      function used for clear mother div
/////////////////////////
const clear_div=(div_mother)=>{
    var father_div1 = document.getElementById(div_mother);

    while(father_div1.firstChild) {
        father_div1.removeChild(father_div1.firstChild);

    }
};
////////////////////////////////////
//
//  record cookie and update login
//
///////////////////////////////////
if(document.cookie){
    global_my_token = document.cookie.split('=')[1];
    console.log(global_my_token);
    show_feed();
    check_person_detail('me','me')
    .then((find_user)=>{
        global_user_id = find_user.id;
        global_user_name = find_user.username;
    });

}

////////////////////////////////////////////////////
//
//      fucntion for error showing
//
///////////////////////////////////////////////////////
function adderror (text) {

    const curDiv = document.getElementById('error_out');
    let button = document.createElement('input');
    button.type = 'button';
    button.value = '❌';

    curDiv.appendChild(button);
    button.style.float = 'right';


    const newContent = document.createElement('div');
    newContent.id = 'error_pop_out_text';
    newContent.innerText = text;
    newContent.className = 'error-box';
    newContent.style.width = '100%';
    newContent.style.margin = '0 auto';



    curDiv.appendChild(newContent);
    curDiv.style.display = "";

    button.onclick = function () {
        clear_div('error_out');
        curDiv.style.display = "none";
    };
}

////////////////////////////////////////////////////
//
//      fucntion for login
//
///////////////////////////////////////////////////////
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
                    document.cookie = 'Token='+result.token+'';
                    global_my_token = result.token
                    global_user_name = document.getElementById('log_username').value;

                    clear_div('posts_list');
                    show_feed();
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

////////////////////////////////////////////////////
//
//      fucntion for registing
//
///////////////////////////////////////////////////////

document.getElementById('regist_button').addEventListener('click', () => {
    let login_Screen = document.getElementById('loginscreen');
    login_Screen.style.display = 'None';
    let regist_Screen = document.getElementById('registscreen');
    regist_Screen.style.display = 'block';

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
                    document.cookie = 'Token='+result.token+'';
                    global_my_token = result.token;
                    global_user_name = document.getElementById('regist_username').value;
                    clear_div('posts_list');
                    show_feed();
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
////////////////////////////////////////////////////
//
//      fucntion for loading main feed
//
///////////////////////////////////////////////////////
function loadfeed (start,end){
    const result = fetch(`http://localhost:5000/user/feed?p=${start}&n=${end}`,{
        method:'GET',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + global_my_token,
        },

    })
    .then((data) => {
        console.log('Success:', data);
        if(data.status == 200){
            data.json().then(data=>{
                const posts = data.posts;

                /* .sort(function (a, b) {
                    return b.meta.published - a.meta.published;
                  }); */
                posts.map(post=>{
                    post_details(post,'posts_list');
                    console.log(posts);


                });
           });
        } else if (data.status == 403) {
            adderror('The token is incorrect');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

};

function show_feed(){

    document.getElementById('dashboardscreen').style.display = 'block';
    document.getElementById('loginscreen').style.display = 'none';
    document.getElementById('my_post_parts').style.display = 'block';
    document.getElementById('userscreen').style.display = 'none';
    document.getElementById('registscreen').style.display = 'none';
    document.getElementById('back_to_my_page').style.display = 'block';
    document.getElementById('log_out_button').style.display = 'block';

    //////////////////////////////
    //  infinite scroll
    ///////////////////////////////////
    loadfeed(0,10);
    var start = 10;
    window.onscroll = ()=>{
        if((window.scrollY+window.innerHeight)>= 0.95*document.body.scrollHeight
        && document.getElementById('dashboardscreen').style.display != 'none'){
            loadfeed(start,1);
            start = start +1;
        }
    }
}

function unshow_feed(){
    document.getElementById('dashboardscreen').style.display = 'none';
    document.getElementById('loginscreen').style.display = 'block';
    document.getElementById('my_post_parts').style.display = 'none';
    document.getElementById('userscreen').style.display = 'none';
    document.getElementById('registscreen').style.display = 'none';
    document.getElementById('back_to_my_page').style.display = 'none';
    document.getElementById('back_the_main_fead').style.display = 'none';
    document.getElementById('log_out_button').style.display = 'none';

}

////////////////////////////////////////////////////
//
//      fucntion for loading personal page
///////////////////////////////////////////////////////

function load_user_page(username,type){

    console.log(username);
    check_person_detail(type,username)
    .then((find_user)=>{
        console.log(find_user);
        load_personal_following_list(find_user.following);
        clear_div('posts_list');
        document.getElementById('back_the_main_fead').style.display = 'block';
        clear_div('find_username_post');
        clear_div('who_following');
        ////////////////////////////////////
        //
        //  partly update person basic info
        //
        //////////////////////////////////////

        document.getElementById('user_id').innerText = find_user.id;
        document.getElementById('user_Username').innerText = find_user.username;
        document.getElementById('user_Email').innerText = find_user.email;
        document.getElementById('user_Name').innerText =  find_user.name;
        document.getElementById('user_Following').innerText = find_user.following.length;
        document.getElementById('user_Fans').innerText = find_user.followed_num;

        check_if_inmy_following(find_user.id);
        const user_post = find_user.posts;
        ////////////////////////////////////
        //
        //  partly update person post
        //
        //////////////////////////////////////
        let i;
        for (i = 0; i < user_post.length; i++) {
            const result = fetch(`http://localhost:5000/post?id=${user_post[i]}`,{
                method:'GET',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + global_my_token,
                },
            })
            .then((data) => {
                console.log('Success:', data);
                if(data.status == 200){

                    data.json().then(result=>{
                        post_details(result,'find_username_post');

                    });
                } else if (data.status == 403) {
                    adderror('The token is incorrect');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });

    //////////////////////////////////////////////////////////////////////////////////
    //      parts for show/unshow following
    //////////////////////////////////////////////////////////////////////////////////
    const show_follow_buttom =document.getElementById('who_follow_button');
    show_follow_buttom.value = 'Show following';

    show_follow_buttom.onclick = function(){
        if (show_follow_buttom.value == 'Show following') {
            document.getElementById('who_following').style.display = 'block';
            show_follow_buttom.value = 'Unshow following';

        } else {
            document.getElementById('who_following').style.display = 'none';
            show_follow_buttom.value = 'Show following';
        }

    };

    ////////////////////////////////////////////////////////////////////////
    //      parts for follow and Unfollow
    ////////////////////////////////////////////////////////////////////////////
    const follow_buttom =document.getElementById('follow_buttom');
    const check_user_name = document.getElementById('user_Username').innerText;
    console.log(check_user_name);


    follow_buttom.onclick = function(){
        console.log(check_user_name);

        if (follow_buttom.value == 'Follow') {
            const result = fetch(`http://localhost:5000/user/follow?username=${document.getElementById('user_Username').innerText}`,{
                method:'PUT',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + global_my_token,
                },
            })
            .then((data) => {
                console.log('Success:', data);
                if(data.status == 200){
                    adderror('successful following')
                    document.getElementById('user_Fans').innerText = document.getElementById('user_Fans').innerText*1+1;
                    document.getElementById('follow_buttom').value= 'Unfollow';


                } else if (data.status == 400) {
                    adderror('You cannot follow youself!');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            })


        } else if (follow_buttom.value == 'Unfollow'){
            const result = fetch(`http://localhost:5000/user/unfollow?username=${document.getElementById('user_Username').innerText}`,{

                method:'PUT',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + global_my_token,
                },
            })
            .then((data) => {
                console.log('Success:', data);
                if(data.status == 200){
                    adderror('successful Unfollowing')
                    document.getElementById('user_Fans').innerText -= 1;

                    document.getElementById('follow_buttom').value= 'Follow';


                } else if (data.status == 403) {
                    adderror('The token is incorrect');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });


        } else if (follow_buttom.value == 'Update the profile'){
            document.getElementById('update_details').style.display='block';
            document.getElementById('userscreen').style.display='none';



        }

    };


};
////////////////////////////////////////////////////
//
//      fucntion for Updating my details
//
///////////////////////////////////////////////////////
document.getElementById('update_details_button').addEventListener('click', () => {
    const update_details = {
        'email': document.getElementById('update_Email').value,
        'name': document.getElementById('update_Name').value,
        "password": document.getElementById('update_Password').value,

    };
    const result = fetch('http://localhost:5000/user',{
        method:'PUT',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + global_my_token,

        },
        body: JSON.stringify(update_details),
    })
    .then((data) => {
        console.log('Success:', data);
        if(data.status == 200){

            load_user_page(global_user_name,'username');
            document.getElementById('update_details').style.display='none';
            document.getElementById('userscreen').style.display='block';


        } else if (data.status == 400) {
            adderror('You cannot follow youself!');
        }
    });
    document.getElementById('update_details').style.display='none';
    document.getElementById('userscreen').style.display='block';
});
////////////////////////////////////////////////////
//
//      fucntion for get one's user details
//
///////////////////////////////////////////////////////
function check_person_detail(type,text){
    let url;
    if (type == 'me'){
        url = 'http://localhost:5000/user';
    } else {
        url = 'http://localhost:5000/user?'+type+'='+text;
    }


    return fetch(url,{
        method:'GET',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + document.cookie.split('=')[1],
        },
    })
    .then((data) => {
        console.log('Success:', data);
        if(data.status == 200){
            return data.json();

        } else if (data.status == 403) {
            adderror('The token is incorrect');
        } else if (data.status == 404) {
            adderror('User not found, please check your input');
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////
//      load personal following list
//////////////////////////////////////////////////////////////////////////////////
const load_personal_following_list=(user_Following)=>{

    for (let i = 0; i < user_Following.length; i++) {

        check_person_detail('id',`${user_Following[i]}`)
        .then(result=>{
            const name = document.createElement('div');

            name.innerText =result.username+ '😉';
            name.className='click_name';

            who_following.appendChild(name);

            name.onclick =function(){
                document.getElementById('dashboardscreen').style.display='none';
                document.getElementById('userscreen').style.display='block';
                load_user_page(result.username,'username');

                console.log('check');

            };

            if (result.username == global_user_name
            ){
                follow_button.value = 'Unfollow';
            }
        });

    }
};
////////////////////////////////////////////////////////////////////////////////////////
//   function used for checking if one person I have been followed
////////////////////////////////////////////////////////////////////////////////////////
function check_if_inmy_following(id){
    const result = fetch(`http://localhost:5000/user`,{
        method:'GET',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + global_my_token,
        },
    })
    .then((data) => {
        console.log('Success:', data);
        if(data.status == 200){

            data.json().then(result=>{
                global_user_id = result.id;
                global_user_name =result.username;

                if (id == global_user_id) {
                    document.getElementById('follow_buttom').value = 'Update the profile'

                    document.getElementById('find_username').innerText = 'Please check your personal page.';

                }else{
                    document.getElementById('find_username').innerText = 'Please check '
                    +document.getElementById('user_Username').innerText+"'s personal page.";
                    if (result.following.includes(id)) {
                        document.getElementById('follow_buttom').value= 'Unfollow';
                        console.log('this people has been follow');

                    } else {
                        document.getElementById('follow_buttom').value= 'Follow';
                    }


                }
            });

        } else if (data.status == 403) {
            adderror('The token is incorrect');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

}
////////////////////////////////////////////////////
//
//      fucntion for backing main home feed
//
///////////////////////////////////////////////////////
document.getElementById('back_the_main_fead').addEventListener('click', () => {
    document.getElementById('back_the_main_fead').style.display = 'none';

    clear_div('posts_list');
    show_feed();
});
////////////////////////////////////////////////////
//
//      fucntion for logout
//
///////////////////////////////////////////////////////
document.getElementById('log_out_button').addEventListener('click', () => {
    unshow_feed();
    document.cookie = "Token=; expires = Thu, 01 Jan 2020 00:00:00 UTC";
    console.log(document.cookie);

});
////////////////////////////////////////////////////
//
//      fucntion for backing home page
//
///////////////////////////////////////////////////////
document.getElementById('back_to_my_page').addEventListener('click', () => {
    clear_div('posts_list');

    load_user_page(global_user_name,'username');
    document.getElementById('userscreen').style.display='block';
    document.getElementById('dashboardscreen').style.display='none';
});
////////////////////////////////////////////////////
//
//      Search a person
//
///////////////////////////////////////////////////////
document.getElementById('search_button').addEventListener('click', () => {
    clear_div('posts_list');

    load_user_page(document.getElementById('search_user').value
    ,document.getElementById('search_type').value);
    document.getElementById('userscreen').style.display='block';
    document.getElementById('dashboardscreen').style.display='none';
});




////////////////////////////////////////////////////
//
//      fucntion for posting
//
///////////////////////////////////////////////////////
document.getElementById('new_post_button').addEventListener('click', () => {
    const file = document.getElementById('photo_upload').files[0];
    fileToDataUrl(file)
    .then((src_url)=>{
        const Body = {
            "description_text":document.getElementById('input_content').value,
            "src":''+src_url.substring(22)
        }
        console.log(src_url);
        console.log('/'+src_url.substring(22));
        console.log(src_url);
        const result = fetch(`http://localhost:5000/post`,{

                method:'POST',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + global_my_token,
                },
                body: JSON.stringify(Body),
            })
            .then((data) => {
                console.log('Success:', data);
                if(data.status == 200){
                    adderror('successful post!');
                    document.getElementById('input_content').value = '';
                    document.getElementById('photo_upload').value = '';
                } else if (data.status == 400) {
                    adderror('the image is incorrect!');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});

//////////////////////////////////////////////////////
//
//  function for fetching each post
//
//////////////////////////////////////////////////////

function fetch_one_post(id,type){
    let url = 'http://localhost:5000/post?id='+id
    return fetch(url,{
        method: type,
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + document.cookie.split('=')[1],
        },
    })
    .then((data) => {
        console.log('Success:', data);
        if(data.status == 200){
            return data.json();

        } else if (data.status == 403) {
            adderror('The token is incorrect');
        }
    });
}

//////////////////////////////////////////////////////
//
//  function for creating comment part
//
//////////////////////////////////////////////////////
function comment_content(oldpost,id){
    fetch_one_post(oldpost.id,'GET')
    .then(post=>{
        var N_comment = (post.comments).length;
        const commet_part_1 = document.getElementById(id);
        const show_comment_button = document.getElementById(`${oldpost.id}show_comment_button`);

        if (commet_part_1.style.display != 'block') {
            show_comment_button.value = `  📬 (show) Comment: ${N_comment}  ` ;

        } else {
            show_comment_button.value = `  📬 (Unshow) Comment: ${N_comment}  ` ;
        }

        for (var i = 0; i < post.comments.length; i++) {
            const comment_used = document.createElement('div');
            comment_used.style.color = 'black';
            comment_used.style.fontSize = '10px';
            const auth = post.comments[i.toString()].author;
            let timestamp3 =new Date(parseInt(post.comments[i.toString()].published)*1000+ 8 * 3600 * 1000).toJSON().substr(0, 19).replace('T', ' ' );
            const who_commet_name = document.createElement('div');
            who_commet_name.innerText =`${auth}: `;
            who_commet_name.className = 'click_name'
            document.getElementById(id).appendChild(who_commet_name);
            comment_used.innerText =  `${post.comments[i.toString()].comment} (${timestamp3} )` ;
            document.getElementById(id).appendChild(comment_used);
            who_commet_name.onclick =function(){
                document.getElementById('dashboardscreen').style.display='none';
                document.getElementById('userscreen').style.display='block';
                console.log('check');
                load_user_page(`${auth}`,'username');
            };
        }
    });
}
//////////////////////////////////////////////////////
//
//  function for creating like name list_parts
//
//////////////////////////////////////////////////////
function like_namelist(oldpost,id){
    fetch_one_post(oldpost.id,'GET')
    .then(post=>{
        // load who like this comment
        const id_list = post.meta.likes;
        let i;
        for (i = 0; i < id_list.length; i++) {
            check_person_detail('id',`${id_list[i]}`)
            .then(result=>{
                const who_like_name = document.createElement('div');
                who_like_name.innerText =result.username+ '👍';
                who_like_name.className='click_name';
                document.getElementById(id).appendChild(who_like_name);
                who_like_name.onclick =function(){
                    document.getElementById('dashboardscreen').style.display='none';
                    document.getElementById('userscreen').style.display='block';
                    load_user_page(`${result.username}`,'username');
                    console.log('check');

                };
                if (result.username == global_user_name ){
                    const like_button = document.getElementById(`${post.id}like_button`);
                    like_button.value = ' Unlike  👍';
                    like_button.style.backgroundColor = 'grey';
                    var N_like = (post.meta.likes).length;
                    let who_like_button = document.getElementById(`${post.id}who_like_button`);
                    who_like_button.value = `Likes:     ${N_like}` ;
                }
            });
        };
});
}



////////////////////////////////////////////////////
//
//      fucntion for showing each single post
//
///////////////////////////////////////////////////////
const post_details = (post,mother_div) =>{

    // for each post detail;
    let posteach = document.createElement('div');
    posteach.id = `${post.id}posteach`;
    posteach.className = 'post-box';
    document.getElementById(mother_div).appendChild(posteach);


    //grab the author
    const feed_author = document.createElement('div');
    feed_author.innerText= `By ${post.meta.author}`;
    feed_author.id = `${post.id}feed_author`;

    feed_author.className = 'click_name';
    posteach.appendChild(feed_author);
    feed_author.onclick =function(){
        document.getElementById('dashboardscreen').style.display='none';
        document.getElementById('userscreen').style.display='block';
        console.log('check');
        load_user_page(`${post.meta.author}`,'username');
    };
    //time
    const feed_time = document.createElement('div');
    feed_time.className='dateposition';
    //let timestamp3 = new Date(post.meta.published);
    let timestamp3 =new Date(parseInt(post.meta.published)*1000+ 8 * 3600 * 1000).toJSON().substr(0, 19).replace('T', ' ' );
    feed_time.innerText= `${timestamp3}`;
    posteach.appendChild(feed_time);
    //image
    const feed_imag = document.createElement('img');
    feed_imag.setAttribute('src',`data:image/jpeg;base64,${post.thumbnail}`);
    feed_imag.style.width = '100%';
    feed_imag.style.margin = 'auto';
    const feed_imag_part = document.createElement('div');
    feed_imag_part.appendChild(feed_imag);
    feed_imag_part.className = 'image';
    posteach.appendChild(feed_imag_part);
    ////////////////////////////////////////////////////
    //
    //      fucntion for edit part
    //
    ///////////////////////////////////////////////////////
    console.log(post.meta.author);
    console.log(global_user_name);

    if (global_user_name == post.meta.author) {
        const edit_part = document.createElement('div');
        posteach.appendChild(edit_part);
        edit_part.style.width = '100%';
        edit_part.style.paddingBottom = '1em'

        let Edit_button = document.createElement('input');
        Edit_button.type = 'button';
        Edit_button.value = 'Edit the post';
        Edit_button.className = 'bottom_style';
        edit_part.appendChild(Edit_button);
        let new_content;

        Edit_button.onclick = function () {
            if (Edit_button.value == 'Edit the post'){
                feed_author.style.display = 'none';
                feed_time.style.display = 'none';
                upper_part.style.display = 'none';
                lower_part.style.display = 'none';

                new_content = document.createElement('textarea');
                new_content.placeholder='you are able to change your post word content now\n';
                new_content.style.width = '100%';
                new_content.style.height = '40px';
                posteach.appendChild(new_content);
                Edit_button.value = 'Finshed and repost it !';

            }else{
                const Body = {
                    "description_text":new_content.value,
                    "src":post.thumbnail
                }
                const result = fetch(`http://localhost:5000/post?id=${post.id}`,{
                        method:'PUT',
                        headers:{
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Token ' + global_my_token,
                        },
                        body: JSON.stringify(Body),
                    })
                    .then((data) => {
                        console.log('Success:', data);
                        if(data.status == 200){
                            adderror('successful edit!');
                            document.getElementById(`${post.id}middle_part`).innerText = new_content.value;
                            feed_author.style.display = 'block';
                            feed_time.style.display = 'block';
                            upper_part.style.display = 'block';
                            lower_part.style.display = 'block';


                            posteach.removeChild(new_content);

                            Edit_button.value = 'Edit the post';
                        } else if (data.status == 400) {
                            adderror('the image is incorrect!');
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }

        }
        ////////////////////////////////////////////////////
        //
        //      fucntion for deleting post
        //
        ///////////////////////////////////////////////////////
        let Delete_button = document.createElement('input');
        Delete_button.type = 'button';
        Delete_button.value = 'Delete the post';
        Delete_button.className = 'bottom_style';
        Delete_button.style.float ='right';
        edit_part.appendChild(Delete_button);
        Delete_button.onclick = function () {
            const result = fetch(`http://localhost:5000/post?id=${post.id}`,{
                method:'DELETE',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + global_my_token,
                },
            })
            .then((data) => {
                console.log('Success:', data);
                if(data.status == 200){
                    adderror('successful delete!');
                    document.getElementById(mother_div).removeChild(posteach);

                } else if (data.status == 400) {
                    adderror('the image is incorrect!');
                }
            });
        }
    }

    // set the comment part and like part
    const like_part = document.createElement('div');
    const commet_part = document.createElement('div');
    const upper_part = document.createElement('div');
    const middle_part = document.createElement('div');
    commet_part.id = `${post.id}commet_part`;
    middle_part.id = `${post.id}middle_part`;

    posteach.appendChild(upper_part);
    posteach.appendChild(middle_part);
    upper_part.style.width='100%';
    middle_part.className='post_text';
    middle_part.style.width='100%';
    //grab the text
    middle_part.innerText= post.meta.description_text + '\n';
    middle_part.className = 'post_text';
    const lower_part = document.createElement('div');
    posteach.appendChild(lower_part);
    lower_part.style.width='100%';



    lower_part.appendChild(like_part);
    posteach.appendChild(commet_part);


    /////////////////////////////
    //      like parts
    ////////////////////////////
    // set like buttom and number of likes calculate
    let like_button = document.createElement('input');
    like_button.type = 'button';
    like_button.value = '   Like  👍  ';
    like_button.style.backgroundColor = 'red';
    like_button.className='bottom_style';
    like_button.id = `${post.id}like_button`;
    upper_part.appendChild(like_button);
    lower_part.appendChild(like_part);


    // load who like this comment
    var N_like = (post.meta.likes).length;
    let who_like_button = document.createElement('input');
    who_like_button.type = 'button';
    who_like_button.value = `Likes:     ${N_like}` ;
    who_like_button.className='bottom_style';
    who_like_button.style.backgroundColor='red';
    who_like_button.id = `${post.id}who_like_button`;
    who_like_button.style.border='1px solid #333';
    
    lower_part.appendChild(who_like_button);
    let wholike = document.createElement('div');
    wholike.id = `${post.id}wholike`;
    like_part.appendChild(wholike);
    wholike.style.display = 'none';

    like_namelist(post,`${post.id}wholike`);
    
    const wholike1 = document.getElementById(`${post.id}wholike`);
    ////////////////////////////////////////////////////
    //
    // fucntion used for like and unlike
    //
    ////////////////////////////////////////////////////
    like_button.onclick = function () {
        if (like_button.value == ' Unlike  👍'){
            const result = fetch(`http://localhost:5000/post/unlike?id=${post.id}`,{
            method:'PUT',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + global_my_token,
            },
        })
        .then((data) => {
            if(data.status == 200){
                console.log('Success:', data);
                like_button.value = '   Like  👍  ';
                like_button.style.backgroundColor = 'red';
                N_like =N_like- 1;
                who_like_button.value = `Likes:     ${N_like}`
                clear_div(wholike.id);
                like_namelist(post,wholike.id)
            }
        });
        } else {
            const result = fetch(`http://localhost:5000/post/like?id=${post.id}`,{

                method:'PUT',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + global_my_token,
                },
            })
            .then((data) => {
                if(data.status == 200){
                    like_button.value = ' Unlike  👍';
                    like_button.style.backgroundColor = 'grey';
                    N_like =N_like + 1;
                    clear_div(wholike.id);
                    like_namelist(post,wholike.id)
                    who_like_button.value = `Likes:     ${N_like}`
                }
            });
        }
    };
    who_like_button.onclick = function () {
        if (wholike1.style.display == 'block') {
            wholike1.style.display = 'none';
        } else {
            wholike1.style.display = 'block';
        }
    };
    /////////////////////////////
    //      comments parts
    ////////////////////////////


    //showing all the comments
    // style set
    let comment_button = document.createElement('input');
    comment_button.type = 'button';
    comment_button.value = 'Comment';
    comment_button.className='bottom_style';

    commet_part.className = 'comment_text';


    var N_comment = (post.comments).length;
    let show_comment_button = document.createElement('input');
    show_comment_button.id = `${post.id}show_comment_button`;
    show_comment_button.type = 'button';
    show_comment_button.value = `  📬 (show) Comment: ${N_comment}  `;
    show_comment_button.className='bottom_style';
    show_comment_button.style.border='1px solid #333';
    show_comment_button.style.float = 'right';
    lower_part.appendChild(show_comment_button);

    ////////////////////////////////////////////////////
    //
    // fucntion used for adding comment for each post
    //
    ////////////////////////////////////////////////////
    comment_content(post,commet_part.id);
    const commet_part_1 = document.getElementById(commet_part.id);
    const comment_text= document.createElement('input');
    comment_text.type = 'text';
    comment_text.placeholder="Leave your comment here!"
    upper_part.appendChild(comment_button);

    upper_part.appendChild(comment_text);

    comment_button.style.float='right';
    comment_button.style.marginLeft='5px';
    comment_text.className = 'input_comment';
    commet_part_1.style.display = 'None'

    show_comment_button.onclick = function () {
        if (commet_part_1.style.display == 'block') {
            commet_part_1.style.display = 'none';
            show_comment_button.value = `  📬 (show) Comment: ${N_comment}  ` ;

        } else {
            commet_part_1.style.display = 'block';
            show_comment_button.value = `  📬 (Unshow) Comment: ${N_comment}  ` ;
        }
    }

    ////////////////////////////////////////////////////
    //
    // fucntion used upload comment and live showing
    //
    ////////////////////////////////////////////////////


    comment_button.onclick = function () {

        const update_comment = {
            'comment': comment_text.value,
        };
        const result = fetch(`http://localhost:5000/post/comment?id=${post.id}`,{
            method:'PUT',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + global_my_token,
            },
            body: JSON.stringify(update_comment),
        })
        .then((data) => {
            console.log('Success:', data);
            if(data.status == 200){
                N_comment = N_comment + 1;
                adderror('successful post');
                comment_text.value = '';
                clear_div(commet_part.id);
                comment_content(post,commet_part.id)
            } else if (data.status == 400) {
                adderror("you haven't input anything.");
            }
        });
    };
}

