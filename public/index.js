var $fileInput = $('.file-input');
var $droparea = $('.file-drop-area');
var $idInput = $('.file-id');
var $idMsg = $(".file-download-msg");

// highlight drag area
$fileInput.on('dragenter focus', function() {
  $droparea.addClass('is-active');
});

// back to normal state
$fileInput.on('dragleave blur drop', function() {
  $droparea.removeClass('is-active');
});

// change inner text
$fileInput.on('change', function() {
  if ($(".file-input")[0].files[0] && $(".file-input")[0].files[0].size > 10 * 1024 * 1024) {
    $(".file-upload-msg").html("File size exceded. Maximium size: 10MB")
    $("form#upload-form").trigger("reset")
  } else {
    var $textContainer = $(this).prev();
    var fileName = $(this).val().split('\\').pop();
    $textContainer.text(fileName);
  }
});

// ajax call for upload forms
$(document).ready(function () {
  $("form#upload-form").on("submit", function(e) {
    e.preventDefault()
    if (!$(".file-input")[0].files[0]) {
      $(".file-upload-msg").html("No file selected")
      $("form#upload-form").trigger("reset")
      return
    }
    let formData = new FormData()
    formData.append("file", $(".file-input")[0].files[0])
    $.ajax({
      url: "upload",
      type: "POST",
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success: function(res) {
        $(".file-upload-msg").html(res.message)
        $("#response-id").html(res.data.id)
        $("form#upload-form").trigger("reset")
        setTimeout(function() {
          $(".file-upload-msg").html("click here or drag and drop file here")
        }, 3000)
      },
      error: function(res) {
        $(".file-upload-msg").html(res.responseJSON.data)
        $("form#upload-form").trigger("reset")
      }
    })
  })

  // ajax call for download forms
  $("form#download-form").on("submit", function(e) {
    e.preventDefault()
    if (!$("#file-id").val()) {
      $(".file-id").attr("placeholder", "Enter file id")
      return
    }
    let formData = new FormData()
    formData.append("id", $("#file-id").val())
    $.ajax({
      url: "download",
      type: "POST",
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success: function(res, textStatus, xhr) {
        if (!res.status) {
          $("form#download-form").trigger("reset")
          $("#file-id").attr("placeholder", res.data)
          return
        }
        var filename = "";
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        let blob = new Blob([res])
        let link = document.createElement("a")
        link.href = window.URL.createObjectURL(blob)
        link.download =filename
        link.click()
        $(this).trigger("reset")
      },
      error: function(res) {
        $("form#download-form").trigger("reset")
        $("#file-id").attr("placeholder", res.responseJSON.data)
      }
    })
  })
})
