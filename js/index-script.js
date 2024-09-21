let postsURL = "http://localhost:3000/posts";
let usersURL = "http://localhost:3000/users";
let sessionURL = "http://localhost:3000/session";

document.addEventListener("DOMContentLoaded", () => {
  loggedText = document.getElementById("loggedText");

  postButton = document.getElementById("postButton");
  postWindow = document.getElementById("newPost");

  sendPost = document.getElementById("sendPost");
  cancelPost = document.getElementById("cancelPost");
  closeWindow = document.getElementById("close");
  postsList = document.getElementById("postsList");

  postButton.addEventListener("click", openPostWindow);
  closeWindow.addEventListener("click", closePostWindow);
  sendPost.addEventListener("click", addPosts);
});

writePosts();

async function openPostWindow() {
  let session = await getSession();

  if (session.nick != "") {
    postWindow.style.display = "flex";
  } else {
    alert("Não está logado!");
  }
}

function closePostWindow() {
  postWindow.style.display = "none";
}

async function writePosts() {
  let posts = await getPosts();
  let session = await getSession();

  if (session.nick != "") {
    loggedText.innerHTML = session.nick;
  } else {
    loggedText.innerHTML = "Entrar";
  }

  postsList.innerHTML = "";
  let temp = "";

  posts.forEach((post) => {
    temp +=
      ` <div class="col">
              <div class="card shadow-sm">
              
                <svg
                  class="bd-placeholder-img card-img-top"
                  width="100%"
                  height="225"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Placeholder: Thumbnail"
                  preserveAspectRatio="xMidYMid slice"
                  focusable="false"
                  >
                  
                  <rect width="100%" height="100%" fill="#55595c"></rect>
                  <image href="` +
      post.image +
      `" width="100%" height="100%" alt="No Image"/>
                </svg>
                <div class="card-body">
                  <strong>` +
      post.title +
      `</strong>
                  <p class="card-text">` +
      post.content +
      `</p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="btn-group">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        onclick="classificarPost('` +
      post.id +
      `')"
                      >
                      Classificar
                      </button>
                      `;
    if (post.user === session.nick) {
      temp +=
        `<button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        onclick="editPost('` +
        post.id +
        `')"
                      >
                        Editar
                      </button><button
                        type="button"
                        class="btn btn-sm btn-danger"
                        onclick="deletePost('` +
        post.id +
        `')"
                      >
                        Remover
                      </button>`;
    }
    temp +=
      `</div>
                    <small class="text-body-secondary">Média: ` +
      parseFloat(post.media).toFixed(2) +
      `</small>
      <small>Por: ` +
      post.user.slice(0, 10) +
      `</small>
                  </div>
                </div>
              </div>
            </div>`;
  });

  postsList.innerHTML += temp;
}
async function getPosts() {
  let postsRaw = await fetch(postsURL);
  let posts = await postsRaw.json();
  return posts;
}

async function addPosts() {
  let session = await getSession();

  let title = document.getElementById("title").value;
  let description = document.getElementById("description").value;
  let imageURL = document.getElementById("image").value;

  if (title != "") {
    if (description != "") {
      await fetch(postsURL, {
        method: "POST",
        header: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: description,
          image: imageURL,
          media: 0,
          user: session.nick,
        }),
      });
    }
  }
}

async function editPost(id) {
  let posts = await getPosts();
  let post;

  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id == id) {
      post = posts[i];
    }
  }

  let newTitle = prompt("Novo título", post.title);
  let newDescription = prompt("Nova descrição", post.content);
  let newImage = prompt("Nova URL de imagem", post.image);

  await fetch(`${postsURL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: newTitle,
      content: newDescription,
      image: newImage,
      media: post.media,
      user: post.user,
    }),
  });

  writePosts();
}

async function deletePost(id) {
  try {
    await fetch(`${postsURL}/${id}`, {
      method: "DELETE",
    });
    writePosts();
  } catch (error) {
    console.error("Erro ao deletar o post:", error);
  }
}

async function classificarPost(id) {
  let session = await getSession();

  if (session.nick != "") {
    let posts = await getPosts();
    let post;

    let nota = prompt("Digite sua nota: (máx: 10 | min: 0)");

    if (parseFloat(nota) > 10) {
      nota = 10;
    } else if (nota < 0) {
      nota = 0;
    }

    for (let i = 0; i < posts.length; i++) {
      if (posts[i].id == id) {
        post = posts[i];
      }
    }

    if (post.media === 0) {
      await fetch(`${postsURL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          image: post.image,
          media: nota,
          user: post.user,
        }),
      });
    } else {
      let nova = parseFloat(nota) + parseFloat(post.media);
      nova = nova / 2;
      await fetch(`${postsURL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          image: post.image,
          media: nova,
          user: post.user,
        }),
      });
    }
  } else {
    alert("Não está logado!");
  }
}

async function getUsers() {
  let usersRaw = await fetch(usersURL);
  let users = await usersRaw.json();

  return users;
}

async function getSession() {
  let sessionRaw = await fetch(sessionURL);
  let session = await sessionRaw.json();

  return session;
}

async function register(nick, pass) {
  let users = await getUsers();
  let available = true;
  for (let i = 0; i < users.length; i++) {
    if (users[i].nick == nick) {
      available = false;
      break;
    }
  }
  if (available == true) {
    await fetch(`${usersURL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nick: nick,
        pass: pass,
      }),
    });
    alert("Cadastrado com sucesso!");
  } else {
    alert("Usuário indisponível");
  }
}

async function logar(nick, pass) {
  let users = await getUsers();

  for (let i = 0; i < users.length; i++) {
    if (users[i].nick === nick) {
      console.log("NICK OK");
      if (users[i].pass === pass) {
        console.log("PASS OK");

        await fetch(`${sessionURL}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nick: nick,
          }),
        });
      }
    }
  }
}

async function logout() {
  await fetch(`${sessionURL}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nick: "",
    }),
  });
}
