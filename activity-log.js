export default function({toggleLogIn, myID, useCollection}) { return {

  setup: ()=> ({
    myID, toggleLogIn,
    everything:
      useCollection({_audit: true})
  }),

  methods: {
    removeEverything() {
      if (confirm("Are you SURE you want to remove all your graffiti data? This cannot be undone")) {
        this.everything.removeMine()
      }
    },

    downloadEverything() {
      const file = new Blob(
        [JSON.stringify(this.everything, null, 2)],
        {type: 'application/json'})

      const a = document.createElement("a")
      a.href = URL.createObjectURL(file)
      a.download = 'graffiti-data.json'
      a.click()
    },

    processFile(file) {
      if (!confirm("uploading will not remove existing data but it will replace data with existing IDs, for example data that you have edited. are you sure you want to continue?")) return

      const reader = new FileReader()

      reader.addEventListener("load",
        ()=> this.mergeFile(reader.result))

      reader.readAsText(file)
    },

    async mergeFile(fileString) {
      try {
        const objects = JSON.parse(fileString)
        if(!Array.isArray(objects)) {
          throw 'the uploaded data must be an array of graffiti objects'
        }

        for (const object of objects) {
          await this.everything.update(object)
        }
      } catch(e) {
        alert(JSON.stringify(e))
      }
    }
  },

  template: `
    <nav>
      <menu>
        <li>
          <a href="..">Graffiti Homepage</a>
        </li>
        <li v-if="myID">
          <a href="" @click.prevent="toggleLogIn">Log Out</a>
        </li>
      </menu>
    </nav>

    <h1>
      activity log
    </h1>

    <template v-if="!myID">
      <menu>
        <li>
          <button @click="toggleLogIn">
            🚪 log in 🚪
          </button>
        </li>
      </menu>
    </template>
    <template v-else>
      <menu>
        <li>
          <button @click="downloadEverything">
            💾 download all data 💾
          </button>
        </li>

        <li>
          <label>
            <input type="file" @change="processFile($event.target.files[0])" />
            🔄 upload data 🔄
          </label>
        </li>

        <li>
          <button @click="removeEverything">
            ❌ remove all data ❌
          </button>
        </li>
      </menu>

      <ul v-if="everything.length">
        <li v-for="object in everything" :key="object._id">
          {{object}}
        </li>
      </ul>
      <p v-else>
        you don't have any graffiti data!
      </p>
    </template>`
}}
