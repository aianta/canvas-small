# frozen_string_literal: true

#
# Copyright (C) 2025 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

module Accessibility
  module Rules
    class ImgAltFilenameRule < Accessibility::Rule
      IMAGE_FILENAME_PATTERN = /[^\s]+(.*?)\.(jpg|jpeg|png|gif|svg|bmp|webp)$/i

      self.id = "img-alt-filename"
      self.link = "https://www.w3.org/TR/WCAG20-TECHS/H37.html"

      def self.test(elem)
        return nil if elem.tag_name != "img"
        return nil unless elem.attribute?("alt")

        alt = elem.get_attribute("alt")
        role = elem.attribute?("role") ? elem.get_attribute("role") : nil

        return nil if alt == "" && role == "presentation"
        return nil if alt.blank?

        filename_like = IMAGE_FILENAME_PATTERN.match?(alt)

        I18n.t("Image filenames should not be used as the alt attribute.") if filename_like
      end

      def self.message
        I18n.t("The alt text is just the file name. Add a description for screen readers
        so people who are blind or have low vision can understand what's in the image.")
      end

      def self.why
        I18n.t("Alt text is a description of an image only visible to screen readers.
        Screen readers are software to help people who are blind or have low vision interact with websites and computers.
        The filename is not an adequate description of an image.")
      end

      def self.display_name
        I18n.t("Alt text is filename")
      end

      def self.form(elem)
        Accessibility::Forms::TextInputWithCheckboxField.new(
          checkbox_label: I18n.t("This image is decorative"),
          checkbox_subtext: I18n.t("This image is for visual decoration only and screen readers can skip it."),
          undo_text: I18n.t("Alt text fixed"),
          input_label: I18n.t("Alt text"),
          input_description: I18n.t("Describe what's on the picture."),
          input_max_length: 120,
          can_generate_fix: true,
          generate_button_label: I18n.t("Generate alt text"),
          value: elem.get_attribute("alt") || ""
        )
      end

      def self.generate_fix(elem)
        return nil if elem.tag_name != "img"
        return nil unless elem.attribute?("src")

        src = elem.get_attribute("src")
        ImgAltRuleHelper.generate_alt_text(src)
      end

      def self.fix!(elem, value)
        if value.blank?
          elem["role"] = "presentation"
        elsif IMAGE_FILENAME_PATTERN.match?(value)
          raise StandardError, I18n.t("Image filenames should not be used as the alt attribute.")
        end

        return elem if elem["alt"] == value

        elem["alt"] = value
        elem
      end
    end
  end
end
