# frozen_string_literal: true

#
# Copyright (C) 2017 - present Instructure, Inc.
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
#

require_relative "../graphql_spec_helper"

describe Types::QuizType do
  let_once(:quiz) { quiz_model }
  let(:quiz_type) { GraphQLTypeTester.new(quiz, current_user: @teacher) }

  it "works" do
    expect(quiz_type.resolve("_id")).to eq quiz.id.to_s
  end

  it "has modules" do
    module1 = quiz.context.context_modules.create!(name: "Module 1")
    module2 = quiz.context.context_modules.create!(name: "Module 2")
    quiz.context_module_tags.create!(context_module: module1, context: quiz.context, tag_type: "context_module")
    quiz.context_module_tags.create!(context_module: module2, context: quiz.context, tag_type: "context_module")
    expect(quiz_type.resolve("modules { _id }")).to match_array([module1.id.to_s, module2.id.to_s])
  end

  it "has anonymous_submissions" do
    expect(quiz_type.resolve("anonymousSubmissions")).to be_falsey

    quiz.anonymous_submissions = true
    quiz.save!
    expect(quiz_type.resolve("anonymousSubmissions")).to be_truthy
  end

  describe "submissions_connection" do
    let_once(:quiz_submission) { quiz_with_submission }
    let_once(:quiz) { quiz_submission.quiz }
    let(:quiz_type) { GraphQLTypeTester.new(quiz, current_user: @teacher) }
    let(:submission) { quiz_submission.submission }

    it "returns submissions for the quiz's assignment" do
      expect(
        quiz_type.resolve("submissionsConnection { nodes { _id }}")
      ).to eq [submission.id.to_s]
    end

    it "returns submissions with include_unsubmitted" do
      # Creating another student ensures we have a mix of submitted and unsubmitted users
      student_in_course(course: @course, active_all: true).user
      expect(
        quiz_type.resolve("submissionsConnection(filter: {includeUnsubmitted: true}) { nodes { _id }}")
      ).to include(submission.id.to_s)
    end

    it "respects filter states" do
      expect(
        quiz_type.resolve("submissionsConnection(filter: {states: [unsubmitted]}) { nodes { _id }}")
      ).not_to include(submission.id.to_s)
    end

    it "returns nil if no assignment" do
      quiz_without_assignment = quiz_model
      quiz_without_assignment.workflow_state = "available"
      quiz_without_assignment.save!

      type = GraphQLTypeTester.new(quiz_without_assignment, current_user: @teacher)
      expect(type.resolve("submissionsConnection { nodes { _id }}")).to be_empty
    end

    it "returns nil if no current_user" do
      type = GraphQLTypeTester.new(quiz, current_user: nil)
      expect(type.resolve("submissionsConnection { nodes { _id }}")).to be_nil
    end
  end

  describe "assignedToDates field" do
    context "when standardize_assignment_date_formatting feature flag is disabled" do
      before do
        Account.site_admin.disable_feature!(:standardize_assignment_date_formatting)
      end

      it "returns nil" do
        expect(quiz_type.resolve("assignedToDates { id }")).to be_nil
      end
    end

    context "when standardize_assignment_date_formatting feature flag is enabled" do
      before do
        Account.site_admin.enable_feature!(:standardize_assignment_date_formatting)
      end

      it "includes quiz overrides when present" do
        student = student_in_course(course: @course, active_all: true).user
        override = assignment_override_model(assignment: quiz, due_at: 2.weeks.from_now)
        override.assignment_override_students.create!(user: student)

        result = quiz_type.resolve("assignedToDates { id dueAt title base }")
        expect(result).to be_an(Array)
        expect(result.length).to be > 0
      end
    end
  end
end
